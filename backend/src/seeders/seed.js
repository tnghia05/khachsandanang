require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Voucher = require('../models/Voucher');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany();
    await Hotel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Voucher.deleteMany();

    console.log('Collections cleared');

    // 1. Tạo 2 Host riêng biệt (Multi-tenant B2B)
    const host1 = await User.create({
      fullName: 'Host Sơn Trà (Tenant A)',
      email: 'host@hostay.vn',
      password: 'Host@123',
      phone: '0901234567',
      role: 'host',
      subscription: {
        plan: 'standard',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    const host2 = await User.create({
      fullName: 'Host Hải Châu (Tenant B)',
      email: 'host2@hostay.vn',
      password: 'Host2@123',
      phone: '0907654321',
      role: 'host',
      subscription: {
        plan: 'standard',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    // 2. Super Admin & Customer
    const admin = await User.create({
      fullName: 'Super Admin Hostay',
      email: 'admin@hostay.vn',
      password: 'Admin@123',
      phone: '0912345678',
      role: 'admin',
    });

    const customer = await User.create({
      fullName: 'Customer User',
      email: 'customer@hostay.vn',
      password: 'Customer@123',
      phone: '0923456789',
      role: 'customer',
    });

    // 3. Khởi tạo Khách sạn phân quyền theo Host
    const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const hotelsData = [
      // Khách sạn của Host 1 (Quận Sơn Trà)
      {
        name: 'Hostay Beach Villa',
        type: 'homestay',
        district: 'Son Tra',
        address: '123 Võ Nguyên Giáp, Sơn Trà',
        description: 'Villa ngay bãi biển với view biển tuyệt đẹp, phù hợp gia đình và nhóm bạn.',
        amenities: ['WiFi miễn phí', 'Bể bơi', 'Bãi đỗ xe', 'Sân vườn'],
        hostId: host1._id,
        ratingAverage: 4.8,
        ratingQuantity: 124,
      },
      {
        name: 'Sơn Trà Ocean View',
        type: 'hotel',
        district: 'Son Tra',
        address: '456 Hoàng Sa, Sơn Trà',
        description: 'Khách sạn 4 sao với tầm nhìn toàn cảnh biển Sơn Trà.',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'Nhà hàng', 'Bar', 'Gym'],
        hostId: host1._id,
        ratingAverage: 4.5,
        ratingQuantity: 89,
        isFeatured: true,
        featuredExpiresAt: oneMonthLater,
        marqueeText: 'Ưu đãi hè rực rỡ tại Sơn Trà Ocean View: Tặng bữa sáng buffet & voucher 15% khi đặt phòng tuần này!',
      },
      {
        name: 'Mỹ Khê Sunset Homestay',
        type: 'homestay',
        district: 'Son Tra',
        address: '789 Nguyễn Văn Thoại, Sơn Trà',
        description: 'Homestay ấm cúng gần bãi biển Mỹ Khê, lý tưởng cho cặp đôi.',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'Bếp chung'],
        hostId: host1._id,
        ratingAverage: 4.6,
        ratingQuantity: 56,
      },

      // Khách sạn của Host 2 (Quận Hải Châu & Ngũ Hành Sơn)
      {
        name: 'Dragon Bridge Hotel',
        type: 'hotel',
        district: 'Hai Chau',
        address: '101 Bạch Đằng, Hải Châu',
        description: 'Khách sạn trung tâm bên cầu Rồng, tiện di chuyển mọi nơi.',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'Gym', 'Nhà hàng', 'Spa'],
        hostId: host2._id,
        ratingAverage: 4.3,
        ratingQuantity: 201,
        isFeatured: true,
        featuredExpiresAt: oneMonthLater,
        marqueeText: 'Dragon Bridge Hotel bên sông Hàn: Ngắm cầu Rồng phun lửa ngay tại ban công phòng nghỉ!',
      },
      {
        name: 'Hải Châu Central Apartment',
        type: 'apartment',
        district: 'Hai Chau',
        address: '202 Lê Duẩn, Hải Châu',
        description: 'Căn hộ dịch vụ đầy đủ tiện nghi tại trung tâm thành phố.',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'Bếp riêng', 'Bãi đỗ xe', 'Máy giặt'],
        hostId: host2._id,
        ratingAverage: 4.4,
        ratingQuantity: 67,
      },
      {
        name: 'Riverside Boutique Hotel',
        type: 'hotel',
        district: 'Hai Chau',
        address: '303 Trần Phú, Hải Châu',
        description: 'Khách sạn boutique bên sông Hàn, kiến trúc hiện đại.',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'Spa', 'Nhà hàng', 'Bar'],
        hostId: host2._id,
        ratingAverage: 4.7,
        ratingQuantity: 143,
      },
      {
        name: 'Non Nước Beach Resort',
        type: 'resort',
        district: 'Ngu Hanh Son',
        address: '404 Trường Sa, Ngũ Hành Sơn',
        description: 'Resort 5 sao bên bãi biển Non Nước với dịch vụ đẳng cấp quốc tế.',
        amenities: ['WiFi miễn phí', 'Bể bơi riêng', 'Spa', 'Nhà hàng', 'Bar', 'Gym', 'Sân golf mini'],
        hostId: host2._id,
        ratingAverage: 4.9,
        ratingQuantity: 312,
      },
      {
        name: 'Marble Mountain Homestay',
        type: 'homestay',
        district: 'Ngu Hanh Son',
        address: '505 Huyền Trân Công Chúa, Ngũ Hành Sơn',
        description: 'Homestay yên tĩnh gần Ngũ Hành Sơn, phù hợp khám phá văn hóa.',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'Sân vườn', 'Xe đạp miễn phí'],
        hostId: host2._id,
        ratingAverage: 4.2,
        ratingQuantity: 38,
      },
    ];

    const createdHotels = await Hotel.insertMany(hotelsData);

    // 4. Khởi tạo Phòng cho từng khách sạn
    const roomsData = [];
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

    const createdRooms = await Room.insertMany(roomsData);

    // 5. Seed Vouchers (Toàn sàn vs Scoped Hotel)
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const vouchersData = [
      {
        code: 'HOSTAY50',
        description: 'Voucher Toàn Sàn: Giảm 50.000 VNĐ cho đơn từ 500.000 VNĐ',
        discountType: 'fixed',
        discountAmount: 50000,
        minOrderValue: 500000,
        maxUsage: 200,
        usedCount: 15,
        startDate: new Date('2026-01-01'),
        endDate: oneYearLater,
        isActive: true,
        hotelId: null, // Toàn sàn do Super Admin tài trợ
      },
      {
        code: 'SONTRA10',
        description: 'Ưu đãi Host Sơn Trà: Giảm 10% tối đa 200.000 VNĐ tại Hostay Beach Villa',
        discountType: 'percent',
        discountPercent: 10,
        maxDiscount: 200000,
        minOrderValue: 500000,
        maxUsage: 100,
        usedCount: 5,
        startDate: new Date('2026-01-01'),
        endDate: oneYearLater,
        isActive: true,
        hotelId: createdHotels[0]._id, // Riêng cho Hostay Beach Villa (Host 1)
      },
      {
        code: 'HAICHAU15',
        description: 'Ưu đãi Host Hải Châu: Giảm 15% tối đa 300.000 VNĐ tại Dragon Bridge Hotel',
        discountType: 'percent',
        discountPercent: 15,
        maxDiscount: 300000,
        minOrderValue: 1000000,
        maxUsage: 50,
        usedCount: 3,
        startDate: new Date('2026-01-01'),
        endDate: oneYearLater,
        isActive: true,
        hotelId: createdHotels[3]._id, // Riêng cho Dragon Bridge Hotel (Host 2)
      },
    ];

    await Voucher.insertMany(vouchersData);

    // 6. Seed Sample Bookings cho từng Host để test Analytics & Check-in
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Booking cho Host 1
    await Booking.create([
      {
        customerId: customer._id,
        hotelId: createdHotels[0]._id, // Host 1
        roomId: createdRooms[0]._id,
        checkInDate: yesterday,
        checkOutDate: tomorrow,
        totalPrice: createdRooms[0].pricePerNight * 2,
        depositAmount: Math.round(createdRooms[0].pricePerNight * 2 * 0.3),
        status: 'checked_in',
        paymentStatus: 'fully_paid',
        checkInTimestamp: yesterday,
        guestCount: { adults: 2, children: 0 },
      },
      {
        customerId: customer._id,
        hotelId: createdHotels[1]._id, // Host 1
        roomId: createdRooms[3]._id,
        checkInDate: tomorrow,
        checkOutDate: nextWeek,
        totalPrice: createdRooms[3].pricePerNight * 6,
        depositAmount: Math.round(createdRooms[3].pricePerNight * 6 * 0.3),
        status: 'confirmed',
        paymentStatus: 'partially_paid',
        guestCount: { adults: 2, children: 1 },
      },
    ]);

    // Booking cho Host 2
    await Booking.create([
      {
        customerId: customer._id,
        hotelId: createdHotels[3]._id, // Host 2
        roomId: createdRooms[9]._id,
        checkInDate: tomorrow,
        checkOutDate: nextWeek,
        totalPrice: createdRooms[9].pricePerNight * 5,
        depositAmount: Math.round(createdRooms[9].pricePerNight * 5 * 0.3),
        status: 'confirmed',
        paymentStatus: 'partially_paid',
        guestCount: { adults: 2, children: 0 },
      },
    ]);

    console.log('Database seeded successfully (Multi-tenant Hosts, Hotels, Rooms, Scoped Vouchers, Bookings)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
