const express = require('express');
const router = express.Router();
const voucherController = require('./voucher.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/public', voucherController.getPublicVouchers);
router.post('/apply', protect, voucherController.applyVoucher);

module.exports = router;
