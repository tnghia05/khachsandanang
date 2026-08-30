const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      maxGuests: { type: Number, default: 2 },
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
    },
    roomType: {
      type: String,
      default: 'standard',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    totalRooms: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ hotelId: 1, pricePerNight: 1 });

module.exports = mongoose.model('Room', roomSchema);
