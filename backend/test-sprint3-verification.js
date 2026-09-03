require('dotenv').config();
const mongoose = require('mongoose');
const voucherService = require('./src/modules/voucher/voucher.service');
const adminService = require('./src/modules/admin/admin.service');
const Booking = require('./src/models/Booking');
const Hotel = require('./src/models/Hotel');
const Room = require('./src/models/Room');
const Voucher = require('./src/models/Voucher');
const User = require('./src/models/User');

async function runTests() {
  console.log('==================================================');
  console.log('  HOSTAY SPRINT 3 — TECHNICAL ACCEPTANCE TEST SUITE');
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

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Testing...\n');

    // ----------------------------------------------------
    // TEST 1: Voucher Calculation (Fixed Discount)
    // ----------------------------------------------------
    try {
      const res = await voucherService.applyVoucher({
        voucherCode: 'HOSTAY50',
        orderTotal: 1000000,
      });
      assert(res.discountAmount === 50000, 'HOSTAY50 correctly discounts 50,000 VND');
      assert(res.totalPrice === 950000, 'HOSTAY50 new total is 950,000 VND');
      assert(res.depositAmount === Math.round(950000 * 0.3), 'HOSTAY50 recalculates deposit to 30%');
    } catch (err) {
      assert(false, `Test 1 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 2: Voucher Calculation (Percent Discount with Cap)
    // ----------------------------------------------------
    try {
      const res = await voucherService.applyVoucher({
        voucherCode: 'DANANG10',
        orderTotal: 3000000, // 10% = 300K, capped at 200K
      });
      assert(res.discountAmount === 200000, 'DANANG10 caps 10% discount at 200,000 VND max');
      assert(res.totalPrice === 2800000, 'DANANG10 new total is 2,800,000 VND');
    } catch (err) {
      assert(false, `Test 2 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 3: Voucher Validation Rejection
    // ----------------------------------------------------
    try {
      let rejected = false;
      try {
        await voucherService.applyVoucher({
          voucherCode: 'HOSTAY50',
          orderTotal: 200000, // Min is 500,000
        });
      } catch (err) {
        rejected = true;
      }
      assert(rejected, 'Voucher rejects orders below minOrderValue');

      let notFound = false;
      try {
        await voucherService.applyVoucher({
          voucherCode: 'INVALID_CODE_999',
          orderTotal: 1000000,
        });
      } catch (err) {
        notFound = true;
      }
      assert(notFound, 'Voucher rejects non-existent code');
    } catch (err) {
      assert(false, `Test 3 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 4: Public Vouchers Query
    // ----------------------------------------------------
    try {
      const publicVouchers = await voucherService.getPublicVouchers();
      assert(Array.isArray(publicVouchers) && publicVouchers.length >= 3, 'getPublicVouchers returns active vouchers');
    } catch (err) {
      assert(false, `Test 4 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 5: Receptionist Check-in / Check-out Cycle
    // ----------------------------------------------------
    try {
      const confirmedBooking = await Booking.findOne({ status: 'confirmed' });
      assert(!!confirmedBooking, 'Found confirmed booking for check-in test');

      if (confirmedBooking) {
        // Test QR / BookingCode lookup
        const lookup = await adminService.lookupBooking(confirmedBooking.bookingCode);
        assert(lookup && lookup._id.toString() === confirmedBooking._id.toString(), 'lookupBooking successfully retrieves by bookingCode');

        // Test Check-in
        const checkedIn = await adminService.checkIn(confirmedBooking._id);
        assert(checkedIn.status === 'checked_in', 'checkIn changes booking status to checked_in');
        assert(!!checkedIn.checkInTimestamp, 'checkIn records checkInTimestamp');

        // Test Check-out
        const checkedOut = await adminService.checkOut(confirmedBooking._id);
        assert(checkedOut.status === 'completed', 'checkOut changes booking status to completed');
        assert(!!checkedOut.checkOutTimestamp, 'checkOut records checkOutTimestamp');
      }
    } catch (err) {
      assert(false, `Test 5 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 6: PMS Analytics Calculation
    // ----------------------------------------------------
    try {
      const adminUser = await User.findOne({ role: 'admin' });
      const analytics = await adminService.getAnalytics(adminUser);

      assert(typeof analytics.totalRevenue === 'number' && analytics.totalRevenue > 0, 'Analytics computes totalRevenue > 0');
      assert(typeof analytics.occupancyRate === 'number' && analytics.occupancyRate >= 0, 'Analytics computes occupancyRate');
      assert(Array.isArray(analytics.monthlyRevenue) && analytics.monthlyRevenue.length === 6, 'Analytics generates 6-month revenue chart series');
      assert(analytics.statusCounts && typeof analytics.statusCounts.total === 'number', 'Analytics aggregates booking status distribution');
    } catch (err) {
      assert(false, `Test 6 Failed: ${err.message}`);
    }

    // ----------------------------------------------------
    // TEST 7: CRUD Service Integrity
    // ----------------------------------------------------
    try {
      const adminUser = await User.findOne({ role: 'admin' });
      const hotels = await adminService.getHotels(adminUser);
      assert(Array.isArray(hotels) && hotels.length > 0, 'getHotels returns list with room counts');
      assert(typeof hotels[0].roomsCount === 'number', 'Hotel item includes roomsCount');

      const rooms = await adminService.getRooms({});
      assert(Array.isArray(rooms) && rooms.length > 0, 'getRooms returns list of rooms');

      const vouchers = await adminService.getVouchers();
      assert(Array.isArray(vouchers) && vouchers.length > 0, 'getVouchers returns list of vouchers');
    } catch (err) {
      assert(false, `Test 7 Failed: ${err.message}`);
    }

    console.log('\n==================================================');
    console.log(`  RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test Suite Setup Error:', err);
    process.exit(1);
  }
}

runTests();
