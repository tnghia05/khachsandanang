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

exports.getHotelById = catchAsync(async (req, res, next) => {
  const result = await hotelService.getHotelById(req.params.id);
  res.status(200).json({
    success: true,
    data: result
  });
});

exports.getFeaturedHotels = catchAsync(async (req, res, next) => {
  const result = await hotelService.getFeaturedHotels();
  res.status(200).json({
    success: true,
    data: result
  });
});

