const express = require('express');
const router = express.Router();
const { searchHotels } = require('./hotel.controller');

router.get('/search', searchHotels);

module.exports = router;
