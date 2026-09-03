const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const tenantGuard = require('../../middlewares/tenantGuard');
const checkSubscription = require('../../middlewares/checkSubscription');

// Áp dụng bảo vệ cho tất cả các route admin
router.use(protect, authorize('admin', 'host'), tenantGuard, checkSubscription);

// 1. Thống kê Analytics & Gói thuê bao SaaS
router.get('/analytics', adminController.getAnalytics);
router.get('/subscription', adminController.getSubscriptionInfo);

// 2. Lễ tân Check-in / Check-out & Đặt phòng
router.get('/bookings/lookup', adminController.lookupBooking);
router.patch('/bookings/:id/check-in', adminController.checkIn);
router.patch('/bookings/:id/check-out', adminController.checkOut);
router.get('/bookings', adminController.getAllBookings);

// 3. Quản lý Khách sạn & Gói Quảng Cáo
router.get('/hotels', adminController.getHotels);
router.post('/hotels', adminController.createHotel);
router.put('/hotels/:id', adminController.updateHotel);
router.patch('/hotels/:id/toggle-status', adminController.toggleHotelStatus);
router.patch('/hotels/:id/ad-package', adminController.updateHotelAdPackage);

// 4. Quản lý Phòng
router.get('/rooms', adminController.getRooms);
router.post('/rooms', adminController.createRoom);
router.put('/rooms/:id', adminController.updateRoom);
router.patch('/rooms/:id/toggle-status', adminController.toggleRoomStatus);

// 5. Quản lý Voucher
router.get('/vouchers', adminController.getVouchers);
router.post('/vouchers', adminController.createVoucher);
router.put('/vouchers/:id', adminController.updateVoucher);
router.delete('/vouchers/:id', adminController.deleteVoucher);

module.exports = router;
