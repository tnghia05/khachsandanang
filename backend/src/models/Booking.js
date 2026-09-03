const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalNights: {
      type: Number,
    },
    guestCount: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'fully_paid', 'refunded'],
      default: 'unpaid',
    },
    qrCodeData: {
      type: String,
    },
    holdExpiresAt: {
      type: Date,
    },
    voucherCode: {
      type: String,
      default: '',
    },
    checkInTimestamp: {
      type: Date,
    },
    checkOutTimestamp: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre('save', function (next) {
  if (this.checkInDate && this.checkOutDate) {
    const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
    this.totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (this.isNew) {
    const timestamp = Date.now().toString().slice(-6);
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    this.bookingCode = `HT${timestamp}${randomDigits}`;
  }
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
