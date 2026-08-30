require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany();
    await Hotel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();

    console.log('Collections cleared');

    const host = await User.create({
      fullName: 'Host User',
      email: 'host@hostay.vn',
      password: 'Host@123',
      phone: '0901234567',
      role: 'host'
    });

    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@hostay.vn',
      password: 'Admin@123',
      phone: '0912345678',
      role: 'admin'
    });

    const customer = await User.create({
      fullName: 'Customer User',
      email: 'customer@hostay.vn',
      password: 'Customer@123',
      phone: '0923456789',
      role: 'customer'
    });

    const hotelsData = [
      { name: 'Hostay Beach Villa', type: 'homestay', district: 'Son Tra', address: '123 Võ Nguyên Giáp, Sơn Trà', description: 'Villa ngay bãi biển với view biển tuyệt đẹp, phù hợp gia đình và nhóm bạn.', amenities: ['WiFi miễn phí', 'Bể bơi', 'Bãi đỗ xe', 'Sân vườn'], hostId: host._id, ratingAverage: 4.8, ratingQuantity: 124 },
      { name: 'Sơn Trà Ocean View', type: 'hotel', district: 'Son Tra', address: '456 Hoàng Sa, Sơn Trà', description: 'Khách sạn 4 sao với tầm nhìn toàn cảnh biển Sơn Trà.', amenities: ['WiFi miễn phí', 'Điều hòa', 'Nhà hàng', 'Bar', 'Gym'], hostId: host._id, ratingAverage: 4.5, ratingQuantity: 89 },
      { name: 'Mỹ Khê Sunset Homestay', type: 'homestay', district: 'Son Tra', address: '789 Nguyễn Văn Thoại, Sơn Trà', description: 'Homestay ấm cúng gần bãi biển Mỹ Khê, lý tưởng cho cặp đôi.', amenities: ['WiFi miễn phí', 'Điều hòa', 'Bếp chung'], hostId: host._id, ratingAverage: 4.6, ratingQuantity: 56 },
      { name: 'Dragon Bridge Hotel', type: 'hotel', district: 'Hai Chau', address: '101 Bạch Đằng, Hải Châu', description: 'Khách sạn trung tâm bên cầu Rồng, tiện di chuyển mọi nơi.', amenities: ['WiFi miễn phí', 'Điều hòa', 'Gym', 'Nhà hàng', 'Spa'], hostId: host._id, ratingAverage: 4.3, ratingQuantity: 201 },
      { name: 'Hải Châu Central Apartment', type: 'apartment', district: 'Hai Chau', address: '202 Lê Duẩn, Hải Châu', description: 'Căn hộ dịch vụ đầy đủ tiện nghi tại trung tâm thành phố.', amenities: ['WiFi miễn phí', 'Điều hòa', 'Bếp riêng', 'Bãi đỗ xe', 'Máy giặt'], hostId: host._id, ratingAverage: 4.4, ratingQuantity: 67 },
      { name: 'Riverside Boutique Hotel', type: 'hotel', district: 'Hai Chau', address: '303 Trần Phú, Hải Châu', description: 'Khách sạn boutique bên sông Hàn, kiến trúc hiện đại.', amenities: ['WiFi miễn phí', 'Điều hòa', 'Spa', 'Nhà hàng', 'Bar'], hostId: host._id, ratingAverage: 4.7, ratingQuantity: 143 },
      { name: 'Non Nước Beach Resort', type: 'resort', district: 'Ngu Hanh Son', address: '404 Trường Sa, Ngũ Hành Sơn', description: 'Resort 5 sao bên bãi biển Non Nước với dịch vụ đẳng cấp quốc tế.', amenities: ['WiFi miễn phí', 'Bể bơi riêng', 'Spa', 'Nhà hàng', 'Bar', 'Gym', 'Sân golf mini'], hostId: host._id, ratingAverage: 4.9, ratingQuantity: 312 },
      { name: 'Marble Mountain Homestay', type: 'homestay', district: 'Ngu Hanh Son', address: '505 Huyền Trân Công Chúa, Ngũ Hành Sơn', description: 'Homestay yên tĩnh gần Ngũ Hành Sơn, phù hợp khám phá văn hóa.', amenities: ['WiFi miễn phí', 'Điều hòa', 'Sân vườn', 'Xe đạp miễn phí'], hostId: host._id, ratingAverage: 4.2, ratingQuantity: 38 },
    ];

    const createdHotels = await Hotel.insertMany(hotelsData);

    const roomsData = [];
    // Bảng giá theo loại hình lưu trú (VNĐ/đêm)
    const priceByType = {
      homestay:  { standard: 350000,  deluxe: 600000,   family: 900000 },
      hotel:     { standard: 500000,  deluxe: 900000,   family: 1500000 },
      apartment: { standard: 450000,  deluxe: 800000,   family: 1200000 },
      resort:    { standard: 800000,  deluxe: 1500000,  family: 2500000 },
    };
    for (const hotel of createdHotels) {
      const prices = priceByType[hotel.type] || priceByType.hotel;
      roomsData.push({
        hotelId: hotel._id,
        name: 'Phòng Standard',
        pricePerNight: prices.standard,
        capacity: { maxGuests: 2, adults: 2, children: 0 },
        roomType: 'standard',
        amenities: ['WiFi miễn phí', 'Điều hòa'],
        totalRooms: 5,
      });
      roomsData.push({
        hotelId: hotel._id,
        name: 'Phòng Deluxe',
        pricePerNight: prices.deluxe,
        capacity: { maxGuests: 3, adults: 2, children: 1 },
        roomType: 'deluxe',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'Bồn tắm', 'Ban công'],
        totalRooms: 3,
      });
      roomsData.push({
        hotelId: hotel._id,
        name: 'Phòng Gia đình',
        pricePerNight: prices.family,
        capacity: { maxGuests: 5, adults: 4, children: 1 },
        roomType: 'family',
        amenities: ['WiFi miễn phí', 'Điều hòa', '2 giường lớn', 'Phòng khách riêng'],
        totalRooms: 2,
      });
    }

    await Room.insertMany(roomsData);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
