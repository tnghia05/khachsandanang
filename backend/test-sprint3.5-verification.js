require('dotenv').config();
const mongoose = require('mongoose');
const adminService = require('./src/modules/admin/admin.service');
const voucherService = require('./src/modules/voucher/voucher.service');
const checkSubscription = require('./src/middlewares/checkSubscription');
const User = require('./src/models/User');
const Hotel = require('./src/models/Hotel');
const Booking = require('./src/models/Booking');
const Voucher = require('./src/models/Voucher');

async function runTests() {
  console.log('================================================================');
  console.log('  HOSTAY SPRINT 3.5 — MULTI-TENANT SAAS ACCEPTANCE TEST SUITE');
  console.log('================================================================\n');

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

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Testing...\n');

    // Nạp các user đã seed
    const host1 = await User.findOne({ email: 'host@hostay.vn' });
    const host2 = await User.findOne({ email: 'host2@hostay.vn' });
    const superAdmin = await User.findOne({ email: 'admin@hostay.vn' });

    assert(!!host1 && !!host2 && !!superAdmin, 'Found Host 1, Host 2 and Super Admin');

    // Lấy danh sách khách sạn của từng host
    const host1Hotels = await Hotel.find({ hostId: host1._id });
    const host2Hotels = await Hotel.find({ hostId: host2._id });
    const host1HotelIds = host1Hotels.map((h) => h._id);
    const host2HotelIds = host2Hotels.map((h) => h._id);

    assert(host1Hotels.length === 3, 'Host 1 owns 3 hotels in Son Tra');
    assert(host2Hotels.length === 5, 'Host 2 owns 5 hotels in Hai Chau / Ngu Hanh Son');

    // ----------------------------------------------------
    // TEST 1: DATA ISOLATION TRONG ANALYTICS
    // ----------------------------------------------------
    try {
      const host1Analytics = await adminService.getAnalytics(host1, host1HotelIds);
      const host2Analytics = await adminService.getAnalytics(host2, host2HotelIds);
      const adminAnalytics = await adminService.getAnalytics(superAdmin, null);

      assert(
        adminAnalytics.totalRevenue >= host1Analytics.totalRevenue + host2Analytics.totalRevenue,
        'Super Admin sees global revenue aggregating all tenants'
      );
      assert(
        host1Analytics.totalRevenue > 0,
        'Host 1 has isolated revenue from their own bookings'
      );
      assert(
        host1Analytics.totalSystemRooms === 30, // 3 hotels * 10 rooms
        'Host 1 totalSystemRooms is isolated to their 3 hotels (30 rooms)'
      );
      assert(
        host2Analytics.totalSystemRooms === 50, // 5 hotels * 10 rooms
        'Host 2 totalSystemRooms is isolated to their 5 hotels (50 rooms)'
      );
    } catch (err) {
      assert(false, `Test 1 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 2: ANTI CROSS-CHECKIN (CHẶN CHECK-IN CHÉO)
    // ----------------------------------------------------
    try {
      const host2Booking = await Booking.findOne({ hotelId: host2Hotels[0]._id });
      assert(!!host2Booking, 'Found booking belonging to Host 2');

      // Host 1 cố tình lookup đơn của Host 2
      let lookupBlocked = false;
      try {
        await adminService.lookupBooking(host2Booking.bookingCode, host1, host1HotelIds);
      } catch (err) {
        if (err.statusCode === 403) lookupBlocked = true;
      }
      assert(lookupBlocked, 'Host 1 is blocked with 403 when looking up Host 2 booking');

      // Host 1 cố tình check-in đơn của Host 2
      let checkInBlocked = false;
      try {
        await adminService.checkIn(host2Booking._id, host1, host1HotelIds);
      } catch (err) {
        if (err.statusCode === 403) checkInBlocked = true;
      }
      assert(checkInBlocked, 'Host 1 is blocked with 403 when attempting check-in on Host 2 booking');

      // Super Admin tra cứu được đơn của bất kỳ Host nào
      const adminLookup = await adminService.lookupBooking(host2Booking.bookingCode, superAdmin, null);
      assert(
        adminLookup && adminLookup.bookingCode === host2Booking.bookingCode,
        'Super Admin bypasses tenant isolation to lookup any booking'
      );
    } catch (err) {
      assert(false, `Test 2 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 3: SCOPED VOUCHER VALIDATION
    // ----------------------------------------------------
    try {
      const host1Booking = await Booking.findOne({ hotelId: host1Hotels[0]._id });
      const host2Booking = await Booking.findOne({ hotelId: host2Hotels[0]._id });

      // SONTRA10 chỉ áp dụng cho Hostay Beach Villa (host1Hotels[0])
      const validScoped = await voucherService.applyVoucher({
        voucherCode: 'SONTRA10',
        orderTotal: 1000000,
        hotelId: host1Hotels[0]._id,
      });
      assert(validScoped.discountAmount === 100000, 'SONTRA10 valid for Host 1 hotel (10% discount)');

      // Thử áp mã SONTRA10 cho khách sạn của Host 2 -> Phải từ chối!
      let invalidScopedBlocked = false;
      try {
        await voucherService.applyVoucher({
          voucherCode: 'SONTRA10',
          orderTotal: 1000000,
          hotelId: host2Hotels[0]._id, // Khách sạn của Host 2
        });
      } catch (err) {
        if (err.statusCode === 400) invalidScopedBlocked = true;
      }
      assert(invalidScopedBlocked, 'SONTRA10 rejected with 400 when applied to another hotel');
    } catch (err) {
      assert(false, `Test 3 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 4: GLOBAL VOUCHER FOR ALL HOTELS
    // ----------------------------------------------------
    try {
      const globalVoucherOnHost1 = await voucherService.applyVoucher({
        voucherCode: 'HOSTAY50',
        orderTotal: 800000,
        hotelId: host1Hotels[0]._id,
      });
      const globalVoucherOnHost2 = await voucherService.applyVoucher({
        voucherCode: 'HOSTAY50',
        orderTotal: 800000,
        hotelId: host2Hotels[0]._id,
      });

      assert(
        globalVoucherOnHost1.discountAmount === 50000 && globalVoucherOnHost2.discountAmount === 50000,
        'Super Admin global voucher HOSTAY50 works seamlessly on both Host 1 and Host 2'
      );
    } catch (err) {
      assert(false, `Test 4 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 5: SUBSCRIPTION EXPIRY GUARD
    // ----------------------------------------------------
    try {
      // Mock Host có gói hết hạn
      const expiredHost = {
        role: 'host',
        subscription: {
          plan: 'standard',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hết hạn hôm qua
          isActive: true,
        },
      };

      let subscriptionBlocked = false;
      const req = { user: expiredHost };
      const res = {};
      const next = (err) => {
        if (err && err.statusCode === 403) subscriptionBlocked = true;
      };

      checkSubscription(req, res, next);
      assert(subscriptionBlocked, 'checkSubscription blocks expired host with 403');

      // Mock Active Host
      let activeAllowed = false;
      const activeHostReq = { user: host1 };
      const nextActive = (err) => {
        if (!err) activeAllowed = true;
      };
      checkSubscription(activeHostReq, res, nextActive);
      assert(activeAllowed, 'checkSubscription allows active host with valid subscription');
    } catch (err) {
      assert(false, `Test 5 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 6: FEATURED AD PACKAGE (BANNER & MARQUEE)
    // ----------------------------------------------------
    try {
      const hotelService = require('./src/modules/hotel/hotel.service');
      const featured = await hotelService.getFeaturedHotels();

      assert(Array.isArray(featured.hotels) && featured.hotels.length >= 2, 'getFeaturedHotels returns sponsored hotels');
      assert(
        Array.isArray(featured.marqueeMessages) && featured.marqueeMessages.length >= 2,
        'getFeaturedHotels returns marquee ticker announcements'
      );
      assert(
        featured.marqueeMessages.some((msg) => msg.includes('Sơn Trà Ocean View')),
        'Marquee ticker includes Son Tra Ocean View announcement'
      );
    } catch (err) {
      assert(false, `Test 6 Failed: ${err.message}`);
    }

    console.log('\n================================================================');
    console.log(`  RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================');

    await mongoose.disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test Suite Setup Error:', err);
    process.exit(1);
  }
}

runTests();
