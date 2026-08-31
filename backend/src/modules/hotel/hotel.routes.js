const express = require('express');
const router = express.Router();
const { searchHotels, getHotelById } = require('./hotel.controller');

router.get('/search', searchHotels);
router.get('/:id', getHotelById);

module.exports = router;
