const Booking = require('../../models/Booking');
const Hotel = require('../../models/Hotel');
const Room = require('../../models/Room');
const Voucher = require('../../models/Voucher');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');

// ==========================================
// 1. ANALYTICS & DASHBOARD
// ==========================================
exports.getAnalytics = async (user) => {
  const hotelFilter = {};
  if (user.role === 'host') {
    hotelFilter.hostId = user._id;
  }

  const hotels = await Hotel.find(hotelFilter).select('_id');
  const hotelIds = hotels.map((h) => h._id);

  const bookingFilter = {};
  if (user.role === 'host') {
    bookingFilter.hotelId = { $in: hotelIds };
  }

  // 1. Tổng doanh thu từ các đơn đã xác nhận / đã check-in / đã hoàn thành
  const revenueBookings = await Booking.find({
    ...bookingFilter,
    status: { $in: ['confirmed', 'checked_in', 'completed'] },
  }).select('totalPrice createdAt checkInDate');

  const totalRevenue = revenueBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // 2. Thống kê số lượng đơn theo từng trạng thái
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

  // 3. Tỷ lệ lấp phòng hôm nay (Occupancy Rate)
  const roomFilter = {};
  if (user.role === 'host') {
    roomFilter.hotelId = { $in: hotelIds };
  }
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

  // 4. Doanh thu theo 6 tháng gần nhất
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
// 2. LỄ TÂN & CHECK-IN KHÔNG CHẠM
// ==========================================
exports.lookupBooking = async (queryCode) => {
  if (!queryCode) {
    throw new AppError('Vui lòng cung cấp mã đơn hoặc dữ liệu QR', 400);
  }

  let searchCode = queryCode.trim();

  // Kiểm tra nếu là chuỗi JSON từ mã QR của Hostay
  try {
    const parsed = JSON.parse(searchCode);
    if (parsed.bookingCode) {
      searchCode = parsed.bookingCode;
    }
  } catch (e) {
    // Không phải JSON, giữ nguyên searchCode
  }

  let booking = await Booking.findOne({ bookingCode: searchCode })
    .populate('customerId', 'fullName email phone')
    .populate('hotelId', 'name district address')
    .populate('roomId', 'name pricePerNight roomType capacity');

  // Thử tìm theo MongoDB ObjectId nếu không tìm thấy theo bookingCode
  if (!booking && searchCode.match(/^[0-9a-fA-F]{24}$/)) {
    booking = await Booking.findById(searchCode)
      .populate('customerId', 'fullName email phone')
      .populate('hotelId', 'name district address')
      .populate('roomId', 'name pricePerNight roomType capacity');
  }

  if (!booking) {
    throw new AppError('Không tìm thấy đơn đặt phòng với mã cung cấp', 404);
  }

  return booking;
};

exports.checkIn = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Không tìm thấy đơn đặt phòng', 404);
  }

  if (booking.status === 'checked_in') {
    throw new AppError('Khách đã làm thủ tục nhận phòng trước đó', 400);
  }

  if (booking.status !== 'confirmed') {
    throw new AppError(`Chỉ đơn đã xác nhận (confirmed) mới được check-in. Đơn này hiện đang ở trạng thái: ${booking.status}`, 400);
  }

  booking.status = 'checked_in';
  booking.checkInTimestamp = new Date();
  await booking.save();

  return await exports.lookupBooking(booking.bookingCode);
};

exports.checkOut = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Không tìm thấy đơn đặt phòng', 404);
  }

  if (booking.status === 'completed') {
    throw new AppError('Khách đã hoàn tất trả phòng trước đó', 400);
  }

  if (booking.status !== 'checked_in') {
    throw new AppError(`Chỉ đơn đang lưu trú (checked_in) mới được check-out. Đơn này hiện đang ở trạng thái: ${booking.status}`, 400);
  }

  booking.status = 'completed';
  booking.checkOutTimestamp = new Date();
  await booking.save();

  return await exports.lookupBooking(booking.bookingCode);
};

exports.getAllBookings = async ({ status, search, page = 1, limit = 10 }) => {
  const filter = {};
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
// 3. CRUD KHÁCH SẠN & PHÒNG
// ==========================================
exports.getHotels = async (user) => {
  const filter = {};
  if (user.role === 'host') {
    filter.hostId = user._id;
  }

  const hotels = await Hotel.find(filter).sort({ createdAt: -1 }).lean();
  
  // Đếm số phòng cho từng khách sạn
  const hotelIds = hotels.map((h) => h._id);
  const rooms = await Room.find({ hotelId: { $in: hotelIds } }).lean();

  const results = hotels.map((hotel) => ({
    ...hotel,
    roomsCount: rooms.filter((r) => r.hotelId.toString() === hotel._id.toString()).length,
  }));

  return results;
};

exports.createHotel = async (hotelData, user) => {
  const newHotel = await Hotel.create({
    ...hotelData,
    hostId: user._id,
  });
  return newHotel;
};

exports.updateHotel = async (id, updateData) => {
  const hotel = await Hotel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!hotel) {
    throw new AppError('Không tìm thấy cơ sở lưu trú', 404);
  }
  return hotel;
};

exports.toggleHotelStatus = async (id) => {
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new AppError('Không tìm thấy cơ sở lưu trú', 404);
  }
  hotel.isActive = !hotel.isActive;
  await hotel.save();
  return hotel;
};

exports.getRooms = async ({ hotelId }) => {
  const filter = {};
  if (hotelId) filter.hotelId = hotelId;

  const rooms = await Room.find(filter).populate('hotelId', 'name district').sort({ createdAt: -1 });
  return rooms;
};

exports.createRoom = async (roomData) => {
  const hotel = await Hotel.findById(roomData.hotelId);
  if (!hotel) {
    throw new AppError('Khách sạn không tồn tại', 404);
  }
  const newRoom = await Room.create(roomData);
  return newRoom;
};

exports.updateRoom = async (id, updateData) => {
  const room = await Room.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!room) {
    throw new AppError('Không tìm thấy phòng', 404);
  }
  return room;
};

exports.toggleRoomStatus = async (id) => {
  const room = await Room.findById(id);
  if (!room) {
    throw new AppError('Không tìm thấy phòng', 404);
  }
  room.isActive = !room.isActive;
  await room.save();
  return room;
};

// ==========================================
// 4. CRUD VOUCHER
// ==========================================
exports.getVouchers = async () => {
  return await Voucher.find().sort({ createdAt: -1 });
};

exports.createVoucher = async (voucherData) => {
  const existing = await Voucher.findOne({ code: voucherData.code.trim().toUpperCase() });
  if (existing) {
    throw new AppError('Mã voucher này đã tồn tại trong hệ thống', 400);
  }
  const voucher = await Voucher.create({
    ...voucherData,
    code: voucherData.code.trim().toUpperCase(),
  });
  return voucher;
};

exports.updateVoucher = async (id, updateData) => {
  if (updateData.code) {
    updateData.code = updateData.code.trim().toUpperCase();
  }
  const voucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!voucher) {
    throw new AppError('Không tìm thấy voucher', 404);
  }
  return voucher;
};

exports.deleteVoucher = async (id) => {
  const voucher = await Voucher.findByIdAndDelete(id);
  if (!voucher) {
    throw new AppError('Không tìm thấy voucher', 404);
  }
  return { message: 'Đã xóa voucher thành công' };
};
