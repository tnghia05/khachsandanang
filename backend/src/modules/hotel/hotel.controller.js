const hotelService = require('./hotel.service');
const catchAsync = require('../../utils/catchAsync');

exports.searchHotels = catchAsync(async (req, res, next) => {
  const { district, checkIn, checkOut, minPrice, maxPrice, guests, type } = req.query;

  const results = await hotelService.searchHotels({
    district,
    checkIn,
    checkOut,
    minPrice,
    maxPrice,
    guests,
    type,
  });

  res.status(200).json({
    success: true,
    total: results.length,
    data: results,
  });
});
