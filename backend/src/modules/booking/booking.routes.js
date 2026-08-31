const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { createBookingValidator } = require('./booking.validator');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/', protect, createBookingValidator, validate, bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.patch('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
