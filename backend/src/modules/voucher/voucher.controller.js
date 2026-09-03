const voucherService = require('./voucher.service');
const catchAsync = require('../../utils/catchAsync');

exports.applyVoucher = catchAsync(async (req, res, next) => {
  const { bookingId, voucherCode, orderTotal, hotelId } = req.body;
  const result = await voucherService.applyVoucher({ bookingId, voucherCode, orderTotal, hotelId });

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getPublicVouchers = catchAsync(async (req, res, next) => {
  const { hotelId } = req.query;
  const vouchers = await voucherService.getPublicVouchers(hotelId);

  res.status(200).json({
    success: true,
    total: vouchers.length,
    data: vouchers,
  });
});
