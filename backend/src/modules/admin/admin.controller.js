const adminService = require('./admin.service');
const catchAsync = require('../../utils/catchAsync');

// ==========================================
// 1. ANALYTICS
// ==========================================
exports.getAnalytics = catchAsync(async (req, res, next) => {
  const result = await adminService.getAnalytics(req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// ==========================================
// 2. RECEPTION & BOOKINGS
// ==========================================
exports.lookupBooking = catchAsync(async (req, res, next) => {
  const { code } = req.query;
  const booking = await adminService.lookupBooking(code, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.checkIn = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const booking = await adminService.checkIn(id, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    message: 'Check-in thành công',
    data: booking,
  });
});

exports.checkOut = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const booking = await adminService.checkOut(id, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    message: 'Check-out thành công',
    data: booking,
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const { status, search, page, limit } = req.query;
  const result = await adminService.getAllBookings({ status, search, page, limit }, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    data: result.bookings,
    pagination: result.pagination,
  });
});

// ==========================================
// 3. CRUD HOTELS & AD PACKAGE
// ==========================================
exports.getHotels = catchAsync(async (req, res, next) => {
  const hotels = await adminService.getHotels(req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    total: hotels.length,
    data: hotels,
  });
});

exports.createHotel = catchAsync(async (req, res, next) => {
  const hotel = await adminService.createHotel(req.body, req.user);
  res.status(201).json({
    success: true,
    data: hotel,
  });
});

exports.updateHotel = catchAsync(async (req, res, next) => {
  const hotel = await adminService.updateHotel(req.params.id, req.body, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    data: hotel,
  });
});

exports.toggleHotelStatus = catchAsync(async (req, res, next) => {
  const hotel = await adminService.toggleHotelStatus(req.params.id, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    message: `Đã ${hotel.isActive ? 'hiển thị' : 'ẩn'} cơ sở lưu trú`,
    data: hotel,
  });
});

exports.updateHotelAdPackage = catchAsync(async (req, res, next) => {
  const hotel = await adminService.updateHotelAdPackage(req.params.id, req.body, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    message: hotel.isFeatured ? 'Đã kích hoạt gói quảng cáo Banner & Dòng chữ chạy thành công' : 'Đã hủy gói quảng cáo',
    data: hotel,
  });
});

// ==========================================
// 4. CRUD ROOMS
// ==========================================
exports.getRooms = catchAsync(async (req, res, next) => {
  const { hotelId } = req.query;
  const rooms = await adminService.getRooms({ hotelId }, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    total: rooms.length,
    data: rooms,
  });
});

exports.createRoom = catchAsync(async (req, res, next) => {
  const room = await adminService.createRoom(req.body, req.user, req.myHotelIds);
  res.status(201).json({
    success: true,
    data: room,
  });
});

exports.updateRoom = catchAsync(async (req, res, next) => {
  const room = await adminService.updateRoom(req.params.id, req.body, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    data: room,
  });
});

exports.toggleRoomStatus = catchAsync(async (req, res, next) => {
  const room = await adminService.toggleRoomStatus(req.params.id, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    message: `Đã ${room.isActive ? 'hiển thị' : 'ẩn'} phòng`,
    data: room,
  });
});

// ==========================================
// 5. CRUD VOUCHERS
// ==========================================
exports.getVouchers = catchAsync(async (req, res, next) => {
  const vouchers = await adminService.getVouchers(req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    total: vouchers.length,
    data: vouchers,
  });
});

exports.createVoucher = catchAsync(async (req, res, next) => {
  const voucher = await adminService.createVoucher(req.body, req.user, req.myHotelIds);
  res.status(201).json({
    success: true,
    data: voucher,
  });
});

exports.updateVoucher = catchAsync(async (req, res, next) => {
  const voucher = await adminService.updateVoucher(req.params.id, req.body, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    data: voucher,
  });
});

exports.deleteVoucher = catchAsync(async (req, res, next) => {
  const result = await adminService.deleteVoucher(req.params.id, req.user, req.myHotelIds);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// ==========================================
// 6. THÔNG TIN THUÊ BAO SAAS
// ==========================================
exports.getSubscriptionInfo = catchAsync(async (req, res, next) => {
  const result = await adminService.getSubscriptionInfo(req.user);
  res.status(200).json({
    success: true,
    data: result,
  });
});
