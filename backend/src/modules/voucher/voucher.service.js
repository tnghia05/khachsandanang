const Voucher = require('../../models/Voucher');
const Booking = require('../../models/Booking');
const AppError = require('../../utils/AppError');

/**
 * Áp dụng mã voucher cho đơn đặt phòng hoặc tính thử giảm giá (Kiểm tra phạm vi Scoped Hotel)
 */
exports.applyVoucher = async ({ bookingId, voucherCode, orderTotal, hotelId }) => {
  if (!voucherCode) {
    throw new AppError('Vui lòng cung cấp mã voucher', 400);
  }

  const cleanCode = voucherCode.trim().toUpperCase();
  const voucher = await Voucher.findOne({ code: cleanCode, isActive: true }).populate('hotelId', 'name');

  if (!voucher) {
    throw new AppError('Mã voucher không tồn tại hoặc đã bị vô hiệu hóa', 404);
  }

  const now = new Date();
  if (now < voucher.startDate) {
    throw new AppError('Mã voucher chưa đến thời gian áp dụng', 400);
  }
  if (now > voucher.endDate) {
    throw new AppError('Mã voucher đã hết hạn sử dụng', 400);
  }
  if (voucher.maxUsage > 0 && voucher.usedCount >= voucher.maxUsage) {
    throw new AppError('Mã voucher đã hết số lượt sử dụng', 400);
  }

  // 1. Nếu có bookingId: cập nhật trực tiếp vào booking
  if (bookingId) {
    const booking = await Booking.findById(bookingId).populate('hotelId', 'name');
    if (!booking) {
      throw new AppError('Không tìm thấy đơn đặt phòng', 404);
    }
    if (booking.status !== 'pending') {
      throw new AppError('Chỉ có thể áp dụng mã ưu đãi cho đơn đang chờ thanh toán', 400);
    }

    // Kiểm tra phạm vi cơ sở lưu trú (Scoped Voucher)
    if (voucher.hotelId) {
      const voucherHotelId = voucher.hotelId._id ? voucher.hotelId._id.toString() : voucher.hotelId.toString();
      const bookingHotelId = booking.hotelId?._id ? booking.hotelId._id.toString() : booking.hotelId?.toString();
      
      if (voucherHotelId !== bookingHotelId) {
        const hotelName = voucher.hotelId.name || 'khách sạn được chỉ định';
        throw new AppError(`Mã ưu đãi này chỉ áp dụng riêng cho ${hotelName}!`, 400);
      }
    }

    // Khôi phục giá gốc nếu trước đó đã từng áp dụng giảm giá
    const baseTotal = booking.totalPrice + (booking.discountAmount || 0);

    if (baseTotal < voucher.minOrderValue) {
      const minValStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.minOrderValue);
      throw new AppError(`Đơn đặt phòng cần đạt tối thiểu ${minValStr} để áp dụng mã này`, 400);
    }

    let discount = 0;
    if (voucher.discountType === 'percent') {
      discount = Math.round((baseTotal * voucher.discountPercent) / 100);
      if (voucher.maxDiscount > 0 && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = Math.min(voucher.discountAmount, baseTotal);
    }

    const newTotalPrice = Math.max(0, baseTotal - discount);
    const newDepositAmount = Math.round(newTotalPrice * 0.3);

    booking.discountAmount = discount;
    booking.totalPrice = newTotalPrice;
    booking.depositAmount = newDepositAmount;
    booking.voucherCode = voucher.code;
    await booking.save();

    return {
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      voucherCode: voucher.code,
      discountAmount: discount,
      totalPrice: newTotalPrice,
      depositAmount: newDepositAmount,
      message: `Đã áp dụng mã ${voucher.code}, giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}`
    };
  }

  // 2. Nếu chỉ truyền orderTotal để tính thử trước
  if (orderTotal !== undefined) {
    if (voucher.hotelId && hotelId) {
      const voucherHotelId = voucher.hotelId._id ? voucher.hotelId._id.toString() : voucher.hotelId.toString();
      if (voucherHotelId !== hotelId.toString()) {
        const hotelName = voucher.hotelId.name || 'khách sạn được chỉ định';
        throw new AppError(`Mã ưu đãi này chỉ áp dụng riêng cho ${hotelName}!`, 400);
      }
    }

    const amount = Number(orderTotal);
    if (amount < voucher.minOrderValue) {
      const minValStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.minOrderValue);
      throw new AppError(`Đơn đặt phòng cần đạt tối thiểu ${minValStr} để áp dụng mã này`, 400);
    }

    let discount = 0;
    if (voucher.discountType === 'percent') {
      discount = Math.round((amount * voucher.discountPercent) / 100);
      if (voucher.maxDiscount > 0 && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = Math.min(voucher.discountAmount, amount);
    }

    const newTotalPrice = Math.max(0, amount - discount);
    return {
      voucherCode: voucher.code,
      discountAmount: discount,
      totalPrice: newTotalPrice,
      depositAmount: Math.round(newTotalPrice * 0.3),
      message: `Mã hợp lệ, được giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}`
    };
  }

  throw new AppError('Cần cung cấp bookingId hoặc orderTotal để tính voucher', 400);
};

/**
 * Lấy danh sách voucher công khai đang còn hiệu lực (Toàn sàn hoặc theo Khách sạn)
 */
exports.getPublicVouchers = async (hotelId) => {
  const now = new Date();
  const filter = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $expr: { $lt: ['$usedCount', '$maxUsage'] }
  };

  if (hotelId) {
    filter.$or = [{ hotelId: null }, { hotelId }];
  } else {
    filter.hotelId = null; // Mặc định chỉ lấy voucher toàn sàn
  }

  return await Voucher.find(filter)
    .populate('hotelId', 'name district')
    .select('code description discountType discountPercent discountAmount maxDiscount minOrderValue endDate hotelId')
    .sort({ discountPercent: -1, discountAmount: -1 });
};
