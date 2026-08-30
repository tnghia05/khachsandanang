const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const generateToken = require('../../utils/generateToken');

exports.register = catchAsync(async (req, res, next) => {
  const { fullName, email, password, phone, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('Email already in use', 400));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
