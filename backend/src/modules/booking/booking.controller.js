const bookingService = require('./booking.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.createBooking = catchAsync(async (req, res, next) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  res.status(201).json({
    success: true,
    data: booking
  });
});

exports.getBookingById = catchAsync(async (req, res, next) => {
  const booking = await bookingService.getBookingById(req.params.id);
  
  if (booking.customerId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this booking', 403));
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await bookingService.getUserBookings(req.user._id);
  res.status(200).json({
    success: true,
    data: bookings
  });
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    data: booking
  });
});
