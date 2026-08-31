const Booking = require('../../models/Booking');
const Room = require('../../models/Room');
const Hotel = require('../../models/Hotel');
const AppError = require('../../utils/AppError');
const redisClient = require('../../config/redis');

exports.createBooking = async (userId, { roomId, checkInDate, checkOutDate, guestCount }) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const hotel = await Hotel.findById(room.hotelId);

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkOut <= checkIn) {
    throw new AppError('Check-out date must be after check-in date', 400);
  }

  // Check overlaps
  const overlappingBookings = await Booking.find({
    roomId,
    status: { $nin: ['cancelled', 'expired'] },
    $or: [
      { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
    ]
  });

  if (overlappingBookings.length > 0) {
    throw new AppError('Room is not available for these dates', 400);
  }

  const checkInISO = checkIn.toISOString();
  const checkOutISO = checkOut.toISOString();
  const holdKey = `booking_hold:${roomId}:${checkInISO}:${checkOutISO}`;
  const existingHold = await redisClient.get(holdKey);

  if (existingHold) {
    throw new AppError('Room is currently being held by another user', 400);
  }

  const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const totalPrice = room.pricePerNight * totalNights;
  const depositAmount = Math.round(totalPrice * 0.3);

  const bookingHoldMinutes = Number(process.env.BOOKING_HOLD_MINUTES) || 15;

  const booking = await Booking.create({
    customerId: userId,
    roomId,
    hotelId: room.hotelId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalPrice,
    depositAmount,
    guestCount,
    status: 'pending',
    paymentStatus: 'unpaid',
    holdExpiresAt: new Date(Date.now() + bookingHoldMinutes * 60 * 1000)
  });

  await redisClient.setex(holdKey, bookingHoldMinutes * 60, booking._id.toString());

  await booking.populate([
    { path: 'roomId', select: 'name pricePerNight roomType amenities capacity' },
    { path: 'hotelId', select: 'name district address type images' }
  ]);

  return booking;
};

exports.getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate({ path: 'roomId', select: 'name pricePerNight roomType amenities capacity' })
    .populate({ path: 'hotelId', select: 'name district address images type' })
    .populate({ path: 'customerId', select: 'fullName email phone' });
    
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  return booking;
};

exports.getUserBookings = async (userId) => {
  return await Booking.find({ customerId: userId })
    .sort({ createdAt: -1 })
    .populate({ path: 'roomId', select: 'name pricePerNight roomType' })
    .populate({ path: 'hotelId', select: 'name district address type images' });
};

exports.cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  
  if (booking.customerId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new AppError('Cannot cancel booking in this status', 400);
  }

  booking.status = 'cancelled';
  await booking.save();

  if (booking.status === 'pending' || booking.status === 'cancelled') {
      const holdKey = `booking_hold:${booking.roomId.toString()}:${booking.checkInDate.toISOString()}:${booking.checkOutDate.toISOString()}`;
      await redisClient.del(holdKey);
  }

  return booking;
};

exports.expireHoldBookings = async () => {
  const expiredBookings = await Booking.find({
    status: 'pending',
    holdExpiresAt: { $lte: new Date() }
  });

  for (const booking of expiredBookings) {
    booking.status = 'expired';
    await booking.save();
    
    const holdKey = `booking_hold:${booking.roomId.toString()}:${booking.checkInDate.toISOString()}:${booking.checkOutDate.toISOString()}`;
    await redisClient.del(holdKey);
  }

  return expiredBookings.length;
};
