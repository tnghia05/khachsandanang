const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['vnpay', 'momo', 'cash_at_counter'],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['deposit', 'full_payment', 'refund'],
      default: 'full_payment',
    },
    gatewayTransactionId: {
      type: String,
    },
    gatewayResponseCode: {
      type: String,
    },
    rawGatewayResponse: {
      type: Object,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
