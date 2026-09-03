const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['hotel', 'homestay', 'resort', 'apartment'],
      default: 'hotel',
    },
    district: {
      type: String,
      required: true,
      enum: [
        'Hai Chau',
        'Son Tra',
        'Ngu Hanh Son',
        'Thanh Khe',
        'Cam Le',
        'Lien Chieu',
        'Hoa Vang',
      ],
    },
    address: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredExpiresAt: {
      type: Date,
    },
    marqueeText: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

hotelSchema.index({ district: 1, type: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
