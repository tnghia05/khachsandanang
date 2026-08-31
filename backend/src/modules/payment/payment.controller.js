const paymentService = require('./payment.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.createPaymentUrl = catchAsync(async (req, res, next) => {
  const { bookingId, paymentMethod } = req.body;
  const result = await paymentService.createPaymentUrl(bookingId, paymentMethod, req.ip);
  res.status(200).json({
    success: true,
    data: result
  });
});

exports.vnpayReturn = catchAsync(async (req, res, next) => {
  const result = await paymentService.handleVNPayReturn(req.query);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (result.success) {
    res.redirect(`${frontendUrl}/booking-success/${result.bookingCode}`);
  } else {
    res.redirect(`${frontendUrl}/payment-failed?bookingId=${result.bookingId || ''}`);
  }
});

exports.vnpayIPN = catchAsync(async (req, res, next) => {
  const result = await paymentService.handleVNPayIPN(req.query);
  res.status(200).json(result);
});

exports.momoIPN = catchAsync(async (req, res, next) => {
  await paymentService.handleMoMoIPN(req.body);
  res.status(204).send();
});
