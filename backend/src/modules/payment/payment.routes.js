const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/create-url', protect, paymentController.createPaymentUrl);
router.get('/vnpay-return', paymentController.vnpayReturn);
router.get('/vnpay-ipn', paymentController.vnpayIPN);
router.post('/momo-ipn', paymentController.momoIPN);

module.exports = router;
