const express = require('express');
const router = express.Router();
const { searchHotels, getHotelById, getFeaturedHotels } = require('./hotel.controller');

router.get('/featured', getFeaturedHotels);
router.get('/search', searchHotels);
router.get('/:id', getHotelById);

module.exports = router;
