const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('./auth.controller');
const { registerValidator, loginValidator } = require('./auth.validator');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
