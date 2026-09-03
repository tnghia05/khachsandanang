const Booking = require('../../models/Booking');
const Hotel = require('../../models/Hotel');
const Room = require('../../models/Room');
const Voucher = require('../../models/Voucher');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');

// ==========================================
// 1. ANALYTICS & DASHBOARD (MULTI-TENANT)
// ==========================================
exports.getAnalytics = async (user, myHotelIds) => {
  const isHost = user.role === 'host';
  const effectiveHotelIds = isHost ? (myHotelIds || []) : null;

  const hotelFilter = isHost ? { _id: { $in: effectiveHotelIds } } : {};
  const bookingFilter = isHost ? { hotelId: { $in: effectiveHotelIds } } : {};
  const roomFilter = isHost ? { hotelId: { $in: effectiveHotelIds } } : {};

  // 1. Tổng doanh thu
  const revenueBookings = await Booking.find({
    ...bookingFilter,
    status: { $in: ['confirmed', 'checked_in', 'completed'] },
  }).select('totalPrice createdAt checkInDate');

  const totalRevenue = revenueBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // 2. Thống kê trạng thái đơn
  const allBookings = await Booking.find(bookingFilter).select('status');
  const statusCounts = {
    total: allBookings.length,
    pending: 0,
    confirmed: 0,
    checked_in: 0,
    completed: 0,
    cancelled: 0,
    expired: 0,
  };

  allBookings.forEach((b) => {
    if (statusCounts[b.status] !== undefined) {
      statusCounts[b.status]++;
    }
  });

  // 3. Tỷ lệ lấp phòng hôm nay
  const rooms = await Room.find({ ...roomFilter, isActive: true }).select('totalRooms');
  const totalSystemRooms = rooms.reduce((sum, r) => sum + (r.totalRooms || 1), 0);

  const today = new Date();
  const todayOccupiedBookings = await Booking.countDocuments({
    ...bookingFilter,
    status: { $in: ['confirmed', 'checked_in'] },
    checkInDate: { $lte: today },
    checkOutDate: { $gte: today },
  });

  const occupancyRate = totalSystemRooms > 0
    ? Math.min(100, Math.round((todayOccupiedBookings / totalSystemRooms) * 100))
    : 0;

  // 4. Doanh thu 6 tháng gần nhất
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();

    const monthLabel = `T${month + 1}/${year}`;
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const monthBookings = revenueBookings.filter(
      (b) => b.createdAt >= startOfMonth && b.createdAt <= endOfMonth
    );

    const rev = monthBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    monthlyRevenue.push({
      month: monthLabel,
      revenue: rev,
      bookingsCount: monthBookings.length,
    });
  }

  // 5. Các đơn đặt phòng mới nhất
  const recentBookings = await Booking.find(bookingFilter)
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('customerId', 'fullName email phone')
    .populate('hotelId', 'name district')
    .populate('roomId', 'name roomType');

  return {
    totalRevenue,
    statusCounts,
    totalSystemRooms,
    todayOccupiedBookings,
    occupancyRate,
    monthlyRevenue,
    recentBookings,
  };
};

// ==========================================
// 2. LỄ TÂN & CHECK-IN KHÔNG CHẠM (ANTI CROSS-CHECKIN)
// ==========================================
exports.lookupBooking = async (queryCode, user, myHotelIds) => {
  if (!queryCode) {
    throw new AppError('Vui lòng cung cấp mã đơn hoặc dữ liệu QR', 400);
  }

  let searchCode = queryCode.trim();
  try {
    const parsed = JSON.parse(searchCode);
    if (parsed.bookingCode) {
      searchCode = parsed.bookingCode;
    }
  } catch (e) {
    // raw string
  }

  let booking = await Booking.findOne({ bookingCode: searchCode })
    .populate('customerId', 'fullName email phone')
    .populate('hotelId', 'name district address hostId')
    .populate('roomId', 'name pricePerNight roomType capacity');

  if (!booking && searchCode.match(/^[0-9a-fA-F]{24}$/)) {
    booking = await Booking.findById(searchCode)
      .populate('customerId', 'fullName email phone')
      .populate('hotelId', 'name district address hostId')
      .populate('roomId', 'name pricePerNight roomType capacity');
  }

  if (!booking) {
    throw new AppError('Không tìm thấy đơn đặt phòng với mã cung cấp', 404);
  }

  // Kiểm soát quyền truy cập Multi-tenant
  if (user.role === 'host') {
    const bookingHotelId = booking.hotelId?._id?.toString() || booking.hotelId?.toString();
    const isOwner = myHotelIds && myHotelIds.some((id) => id.toString() === bookingHotelId);
    if (!isOwner) {
      throw new AppError('Bạn không có quyền quản lý đơn đặt phòng của cơ sở lưu trú khác!', 403);
    }
  }

  return booking;
};

exports.checkIn = async (bookingId, user, myHotelIds) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Không tìm thấy đơn đặt phòng', 404);
  }

  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((id) => id.toString() === booking.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền làm thủ tục nhận phòng cho cơ sở lưu trú khác!', 403);
    }
  }

  if (booking.status === 'checked_in') {
    throw new AppError('Khách đã làm thủ tục nhận phòng trước đó', 400);
  }

  if (booking.status !== 'confirmed') {
    throw new AppError(`Chỉ đơn đã xác nhận (confirmed) mới được check-in. Trạng thái hiện tại: ${booking.status}`, 400);
  }

  booking.status = 'checked_in';
  booking.checkInTimestamp = new Date();
  await booking.save();

  return await exports.lookupBooking(booking.bookingCode, user, myHotelIds);
};

exports.checkOut = async (bookingId, user, myHotelIds) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Không tìm thấy đơn đặt phòng', 404);
  }

  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((id) => id.toString() === booking.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền làm thủ tục trả phòng cho cơ sở lưu trú khác!', 403);
    }
  }

  if (booking.status === 'completed') {
    throw new AppError('Khách đã hoàn tất trả phòng trước đó', 400);
  }

  if (booking.status !== 'checked_in') {
    throw new AppError(`Chỉ đơn đang lưu trú (checked_in) mới được check-out. Trạng thái hiện tại: ${booking.status}`, 400);
  }

  booking.status = 'completed';
  booking.checkOutTimestamp = new Date();
  await booking.save();

  return await exports.lookupBooking(booking.bookingCode, user, myHotelIds);
};

exports.getAllBookings = async ({ status, search, page = 1, limit = 10 }, user, myHotelIds) => {
  const filter = {};
  if (user.role === 'host') {
    filter.hotelId = { $in: myHotelIds || [] };
  }

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ bookingCode: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('customerId', 'fullName email phone')
      .populate('hotelId', 'name district')
      .populate('roomId', 'name roomType pricePerNight'),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

// ==========================================
// 3. CRUD KHÁCH SẠN & DỊCH VỤ QUẢNG CÁO
// ==========================================
exports.getHotels = async (user, myHotelIds) => {
  const filter = {};
  if (user.role === 'host') {
    filter._id = { $in: myHotelIds || [] };
  }

  const hotels = await Hotel.find(filter).sort({ createdAt: -1 }).lean();
  const hotelIds = hotels.map((h) => h._id);
  const rooms = await Room.find({ hotelId: { $in: hotelIds } }).lean();

  return hotels.map((hotel) => ({
    ...hotel,
    roomsCount: rooms.filter((r) => r.hotelId.toString() === hotel._id.toString()).length,
  }));
};

exports.createHotel = async (hotelData, user) => {
  const newHotel = await Hotel.create({
    ...hotelData,
    hostId: user._id,
  });
  return newHotel;
};

exports.updateHotel = async (id, updateData, user, myHotelIds) => {
  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === id.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền chỉnh sửa cơ sở lưu trú của người khác!', 403);
    }
  }

  const hotel = await Hotel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!hotel) {
    throw new AppError('Không tìm thấy cơ sở lưu trú', 404);
  }
  return hotel;
};

exports.toggleHotelStatus = async (id, user, myHotelIds) => {
  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === id.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền thay đổi trạng thái cơ sở lưu trú này!', 403);
    }
  }

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new AppError('Không tìm thấy cơ sở lưu trú', 404);
  }
  hotel.isActive = !hotel.isActive;
  await hotel.save();
  return hotel;
};

// Cấu hình Gói Quảng Cáo (Banner nổi bật + Chữ chạy Marquee)
exports.updateHotelAdPackage = async (id, { isFeatured, durationDays = 30, marqueeText }, user, myHotelIds) => {
  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === id.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền cấu hình quảng cáo cho khách sạn này!', 403);
    }
  }

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new AppError('Không tìm thấy khách sạn', 404);
  }

  hotel.isFeatured = !!isFeatured;
  if (isFeatured) {
    hotel.featuredExpiresAt = new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000);
    hotel.marqueeText = marqueeText || `Chào mừng bạn đến với ${hotel.name}! Khám phá kỳ nghỉ tuyệt vời tại Đà Nẵng với ưu đãi ngập tràn.`;
  } else {
    hotel.marqueeText = '';
  }

  await hotel.save();
  return hotel;
};

// ==========================================
// 4. CRUD PHÒNG
// ==========================================
exports.getRooms = async ({ hotelId }, user, myHotelIds) => {
  const filter = {};
  if (user.role === 'host') {
    if (hotelId) {
      const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === hotelId.toString());
      if (!isOwner) {
        throw new AppError('Bạn không có quyền xem phòng của khách sạn này!', 403);
      }
      filter.hotelId = hotelId;
    } else {
      filter.hotelId = { $in: myHotelIds || [] };
    }
  } else if (hotelId) {
    filter.hotelId = hotelId;
  }

  const rooms = await Room.find(filter).populate('hotelId', 'name district').sort({ createdAt: -1 });
  return rooms;
};

exports.createRoom = async (roomData, user, myHotelIds) => {
  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === roomData.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn chỉ có thể tạo phòng cho cơ sở lưu trú do chính mình quản lý!', 403);
    }
  }

  const hotel = await Hotel.findById(roomData.hotelId);
  if (!hotel) {
    throw new AppError('Khách sạn không tồn tại', 404);
  }
  return await Room.create(roomData);
};

exports.updateRoom = async (id, updateData, user, myHotelIds) => {
  const room = await Room.findById(id);
  if (!room) {
    throw new AppError('Không tìm thấy phòng', 404);
  }

  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === room.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền chỉnh sửa loại phòng này!', 403);
    }
  }

  return await Room.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

exports.toggleRoomStatus = async (id, user, myHotelIds) => {
  const room = await Room.findById(id);
  if (!room) {
    throw new AppError('Không tìm thấy phòng', 404);
  }

  if (user.role === 'host') {
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === room.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền thay đổi trạng thái phòng này!', 403);
    }
  }

  room.isActive = !room.isActive;
  await room.save();
  return room;
};

// ==========================================
// 5. CRUD VOUCHERS (SCOPED MULTI-TENANT)
// ==========================================
exports.getVouchers = async (user, myHotelIds) => {
  const filter = {};
  if (user.role === 'host') {
    // Host xem các voucher thuộc khách sạn của mình hoặc voucher toàn sàn
    filter.$or = [{ hotelId: { $in: myHotelIds || [] } }, { hotelId: null }];
  }

  return await Voucher.find(filter).populate('hotelId', 'name district').sort({ createdAt: -1 });
};

exports.createVoucher = async (voucherData, user, myHotelIds) => {
  if (user.role === 'host') {
    if (!voucherData.hotelId) {
      throw new AppError('Đối tác Host bắt buộc phải chọn cơ sở lưu trú của mình để tạo voucher!', 400);
    }
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === voucherData.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn chỉ được phép tạo voucher cho khách sạn do mình sở hữu!', 403);
    }
  }

  const existing = await Voucher.findOne({ code: voucherData.code.trim().toUpperCase() });
  if (existing) {
    throw new AppError('Mã voucher này đã tồn tại trong hệ thống', 400);
  }

  return await Voucher.create({
    ...voucherData,
    code: voucherData.code.trim().toUpperCase(),
    hotelId: voucherData.hotelId || null,
  });
};

exports.updateVoucher = async (id, updateData, user, myHotelIds) => {
  const voucher = await Voucher.findById(id);
  if (!voucher) {
    throw new AppError('Không tìm thấy voucher', 404);
  }

  if (user.role === 'host') {
    if (!voucher.hotelId) {
      throw new AppError('Bạn không có quyền sửa voucher toàn sàn do Super Admin tài trợ!', 403);
    }
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === voucher.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền sửa voucher của cơ sở khác!', 403);
    }
  }

  if (updateData.code) {
    updateData.code = updateData.code.trim().toUpperCase();
  }

  return await Voucher.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

exports.deleteVoucher = async (id, user, myHotelIds) => {
  const voucher = await Voucher.findById(id);
  if (!voucher) {
    throw new AppError('Không tìm thấy voucher', 404);
  }

  if (user.role === 'host') {
    if (!voucher.hotelId) {
      throw new AppError('Bạn không có quyền xóa voucher toàn sàn của Super Admin!', 403);
    }
    const isOwner = myHotelIds && myHotelIds.some((hid) => hid.toString() === voucher.hotelId.toString());
    if (!isOwner) {
      throw new AppError('Bạn không có quyền xóa voucher của cơ sở khác!', 403);
    }
  }

  await Voucher.findByIdAndDelete(id);
  return { message: 'Đã xóa voucher thành công' };
};

// ==========================================
// 6. QUẢN LÝ GÓI THUÊ BAO SAAS CỦA HOST
// ==========================================
exports.getSubscriptionInfo = async (user) => {
  const hostUser = await User.findById(user._id).select('fullName email role subscription');
  const hotels = await Hotel.find({ hostId: user._id }).select('name district isFeatured featuredExpiresAt marqueeText');

  const now = new Date();
  const expiresAt = hostUser.subscription?.expiresAt ? new Date(hostUser.subscription.expiresAt) : null;
  const daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))) : 0;

  return {
    subscription: hostUser.subscription || {
      plan: 'standard',
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    daysRemaining,
    hotelsCount: hotels.length,
    hotels,
  };
};
