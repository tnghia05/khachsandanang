require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const hotelRoutes = require('./modules/hotel/hotel.routes');

connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotels', hotelRoutes);

app.all('*', (req, res, next) => {
  const AppError = require('./utils/AppError');
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
