const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const AppError = require('../../utils/AppError');
const { VNPay } = require('vnpay');
const crypto = require('crypto');
const axios = require('axios');
const QRCode = require('qrcode');

const createVNPayUrl = async (booking, ipAddr) => {
  const amount = booking.depositAmount || booking.totalPrice;
  const payment = await Payment.create({
    bookingId: booking._id,
    customerId: booking.customerId,
    amount,
    paymentMethod: 'vnpay',
    transactionType: 'full_payment',
    status: 'pending'
  });

  const vnpayInstance = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: 'SHA512',
    enableLog: true
  });

  const paymentUrl = vnpayInstance.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_TxnRef: payment._id.toString(),
    vnp_OrderInfo: `Thanh toan dat phong ${booking.bookingCode}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    vnp_Locale: 'vn'
  });

  return { paymentUrl, paymentId: payment._id };
};

const createMoMoUrl = async (booking) => {
  const amount = booking.depositAmount || booking.totalPrice;
  const payment = await Payment.create({
    bookingId: booking._id,
    customerId: booking.customerId,
    amount,
    paymentMethod: 'momo',
    transactionType: 'full_payment',
    status: 'pending'
  });

  const orderId = payment._id.toString();
  const requestId = orderId;
  const orderInfo = `Thanh toan dat phong ${booking.bookingCode}`;
  const extraData = '';
  
  const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${process.env.MOMO_IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${process.env.MOMO_PARTNER_CODE}&redirectUrl=${process.env.MOMO_RETURN_URL}&requestId=${requestId}&requestType=payWithMethod`;
  const signature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY).update(rawSignature).digest('hex');

  const response = await axios.post(process.env.MOMO_ENDPOINT, {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    partnerName: 'Hostay',
    storeId: 'HostayDaNang',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: process.env.MOMO_RETURN_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
    lang: 'vi',
    requestType: 'payWithMethod',
    autoCapture: true,
    extraData,
    signature
  });

  return { paymentUrl: response.data.payUrl, paymentId: payment._id };
};

const generateBookingQR = async (booking) => {
  await booking.populate([
    { path: 'roomId', select: 'name' },
    { path: 'hotelId', select: 'name' }
  ]);
  
  const qrData = JSON.stringify({
    bookingCode: booking.bookingCode,
    hotel: booking.hotelId?.name || 'Hostay',
    room: booking.roomId?.name || 'Unknown Room',
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    totalPrice: booking.totalPrice
  });
  
  const qrCodeDataUrl = await QRCode.toDataURL(qrData);
  booking.qrCodeData = qrCodeDataUrl;
  await booking.save();
};

exports.createPaymentUrl = async (bookingId, paymentMethod, ipAddr) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  if (booking.status !== 'pending') {
    throw new AppError('Booking is not pending', 400);
  }

  if (paymentMethod === 'vnpay') {
    return await createVNPayUrl(booking, ipAddr);
  } else if (paymentMethod === 'momo') {
    return await createMoMoUrl(booking);
  } else {
    throw new AppError('Unsupported payment method', 400);
  }
};

exports.handleVNPayReturn = async (queryParams) => {
  const vnpayInstance = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: 'SHA512',
    enableLog: true
  });
  
  const verify = vnpayInstance.verifyReturnUrl(queryParams);
  if (!verify.isSuccess) {
    return { success: false, message: verify.message || 'Signature verification failed' };
  }

  const paymentId = queryParams.vnp_TxnRef;
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return { success: false, message: 'Payment not found' };
  }

  if (queryParams.vnp_ResponseCode === '00') {
    const booking = await Booking.findById(payment.bookingId);
    return { success: true, bookingCode: booking?.bookingCode, bookingId: booking?._id };
  } else {
    return { success: false, message: 'Transaction failed', bookingId: payment.bookingId };
  }
};

exports.handleVNPayIPN = async (queryParams) => {
  const vnpayInstance = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: 'SHA512',
    enableLog: true
  });
  
  const verify = vnpayInstance.verifyIpnCall(queryParams);
  if (!verify.isSuccess) {
    return { RspCode: '97', Message: 'Checksum failed' };
  }

  const paymentId = queryParams.vnp_TxnRef;
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return { RspCode: '01', Message: 'Order not found' };
  }

  if (payment.status === 'success') {
    return { RspCode: '02', Message: 'Already confirmed' };
  }

  if (queryParams.vnp_ResponseCode === '00') {
    payment.status = 'success';
    payment.gatewayTransactionId = queryParams.vnp_TransactionNo;
    payment.gatewayResponseCode = queryParams.vnp_ResponseCode;
    payment.rawGatewayResponse = queryParams;
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.paymentStatus = 'fully_paid';
      await generateBookingQR(booking);
    }
  } else {
    payment.status = 'failed';
    payment.gatewayResponseCode = queryParams.vnp_ResponseCode;
    payment.rawGatewayResponse = queryParams;
    await payment.save();
  }

  return { RspCode: '00', Message: 'success' };
};

exports.handleMoMoIPN = async (body) => {
  const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
  
  const signature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY).update(rawSignature).digest('hex');
  if (signature !== body.signature) {
    throw new AppError('Invalid signature', 400);
  }

  const paymentId = body.orderId;
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status === 'success') {
    return; // Already processed
  }

  if (body.resultCode === 0) {
    payment.status = 'success';
    payment.gatewayTransactionId = body.transId.toString();
    payment.rawGatewayResponse = body;
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.paymentStatus = 'fully_paid';
      await generateBookingQR(booking);
    }
  } else {
    payment.status = 'failed';
    payment.rawGatewayResponse = body;
    await payment.save();
  }
};

exports.getPaymentsByBooking = async (bookingId) => {
  return await Payment.find({ bookingId }).sort({ createdAt: -1 });
};
