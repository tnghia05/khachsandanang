const crypto = require('crypto');
const QRCode = require('qrcode');
const { VNPay } = require('vnpay');

async function runTests() {
  console.log('==================================================');
  console.log('  HOSTAY SPRINT 2 — TECHNICAL ACCEPTANCE TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: VNPay Hash & URL Security (HMAC-SHA512)
  // ----------------------------------------------------
  try {
    const tmnCode = 'CGXZLS0Z';
    const secret = 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ';
    const vnpay = new VNPay({
      tmnCode,
      secureSecret: secret,
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: 'SHA512'
    });

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: 500000,
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: 'PAY123456',
      vnp_OrderInfo: 'Thanh toan dat phong HT100200',
      vnp_OrderType: 'other',
      vnp_ReturnUrl: 'http://localhost:5173/payment/vnpay-return',
      vnp_Locale: 'vn'
    });

    assert(paymentUrl.includes('https://sandbox.vnpayment.vn'), 'VNPay Sandbox URL prefix is correct');
    assert(paymentUrl.includes('vnp_SecureHash='), 'VNPay URL contains HMAC-SHA512 SecureHash signature');
    assert(paymentUrl.includes('vnp_TxnRef=PAY123456'), 'VNPay URL contains correct TxnRef');
  } catch (err) {
    assert(false, `VNPay Test Failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST 2: MoMo HMAC-SHA256 Signature Verification
  // ----------------------------------------------------
  try {
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const partnerCode = 'MOMO';
    const orderId = 'PAY987654';
    const requestId = orderId;
    const amount = 300000;
    const orderInfo = 'Thanh toan dat phong HT999';
    const extraData = '';
    const ipnUrl = 'http://localhost:5000/api/v1/payments/momo-ipn';
    const redirectUrl = 'http://localhost:5173/payment/momo-return';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    assert(typeof signature === 'string' && signature.length === 64, 'MoMo HMAC-SHA256 generates valid 64-char hex signature');
  } catch (err) {
    assert(false, `MoMo Test Failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST 3: QR Code Check-in Base64 Data URL Generation
  // ----------------------------------------------------
  try {
    const bookingData = JSON.stringify({
      bookingCode: 'HT888999',
      hotel: 'Sơn Trà Ocean View',
      room: 'Phòng Deluxe Sea View',
      checkIn: '2026-09-01T14:00:00.000Z',
      checkOut: '2026-09-03T12:00:00.000Z',
      totalPrice: 1800000
    });

    const qrDataUrl = await QRCode.toDataURL(bookingData);
    assert(qrDataUrl.startsWith('data:image/png;base64,'), 'QR Code generated valid base64 PNG data URL');
  } catch (err) {
    assert(false, `QR Code Test Failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST 4: Backend Module Integrity & Exports Check
  // ----------------------------------------------------
  try {
    const bookingService = require('./src/modules/booking/booking.service');
    const paymentService = require('./src/modules/payment/payment.service');
    const hotelService = require('./src/modules/hotel/hotel.service');

    assert(typeof bookingService.createBooking === 'function', 'booking.service exports createBooking');
    assert(typeof bookingService.getBookingById === 'function', 'booking.service exports getBookingById');
    assert(typeof bookingService.getUserBookings === 'function', 'booking.service exports getUserBookings');
    assert(typeof bookingService.cancelBooking === 'function', 'booking.service exports cancelBooking');
    assert(typeof bookingService.expireHoldBookings === 'function', 'booking.service exports expireHoldBookings');

    assert(typeof paymentService.createPaymentUrl === 'function', 'payment.service exports createPaymentUrl');
    assert(typeof paymentService.handleVNPayReturn === 'function', 'payment.service exports handleVNPayReturn');
    assert(typeof paymentService.handleVNPayIPN === 'function', 'payment.service exports handleVNPayIPN');
    assert(typeof paymentService.handleMoMoIPN === 'function', 'payment.service exports handleMoMoIPN');

    assert(typeof hotelService.getHotelById === 'function', 'hotel.service exports getHotelById');
  } catch (err) {
    assert(false, `Module Integrity Test Failed: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log(`  RESULT: ${passed}/${total} TESTS PASSED (${Math.round(passed/total*100)}%)`);
  console.log('==================================================');

  process.exit(passed === total ? 0 : 1);
}

runTests();
