const Hotel = require('../../models/Hotel');
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');

exports.searchHotels = async ({ district, checkIn, checkOut, minPrice, maxPrice, guests, type }) => {
  const filter = {};
  if (district) filter.district = district;
  if (type) filter.type = type;

  const hotels = await Hotel.find(filter).lean();
  const hotelIds = hotels.map(h => h._id);

  const roomFilter = { hotelId: { $in: hotelIds } };
  if (minPrice || maxPrice) {
    roomFilter.pricePerNight = {};
    if (minPrice) roomFilter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) roomFilter.pricePerNight.$lte = Number(maxPrice);
  }
  if (guests) {
    roomFilter['capacity.adults'] = { $gte: Number(guests) };
  }

  const rooms = await Room.find(roomFilter).lean();

  let unavailableRoomIds = [];
  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const overlappingBookings = await Booking.find({
      status: { $ne: 'cancelled' },
      $or: [
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
      ]
    }).select('roomId').lean();
    
    unavailableRoomIds = overlappingBookings.map(b => b.roomId.toString());
  }

  const availableRooms = rooms.filter(room => !unavailableRoomIds.includes(room._id.toString()));

  const results = hotels.map(hotel => {
    return {
      ...hotel,
      availableRooms: availableRooms.filter(room => room.hotelId.toString() === hotel._id.toString())
    };
  }).filter(hotel => hotel.availableRooms.length > 0);

  return results;
};

exports.getHotelById = async (hotelId) => {
  const AppError = require('../../utils/AppError');
  const hotel = await Hotel.findById(hotelId).lean();
  if (!hotel) {
    throw new AppError('Hotel not found', 404);
  }
  const rooms = await Room.find({ hotelId }).lean();
  return { ...hotel, rooms };
};

exports.getFeaturedHotels = async () => {
  const now = new Date();
  const hotels = await Hotel.find({
    isActive: true,
    isFeatured: true,
    $or: [{ featuredExpiresAt: { $gte: now } }, { featuredExpiresAt: null }],
  }).lean();

  const marqueeMessages = hotels
    .map((h) => h.marqueeText)
    .filter(Boolean);

  return { hotels, marqueeMessages };
};

