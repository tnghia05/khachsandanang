const Hotel = require('../models/Hotel');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware bảo vệ Multi-tenant:
 * - Super Admin (admin): Bypass kiểm tra cơ sở, được xem toàn sàn.
 * - Đối tác Host (host): Nạp danh sách các ID khách sạn thuộc quyền sở hữu vào req.myHotelIds.
 */
const tenantGuard = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  if (req.user.role === 'admin') {
    req.isSuperAdmin = true;
    req.myHotelIds = null; // null biểu thị toàn quyền xem mọi cơ sở
    return next();
  }

  if (req.user.role === 'host') {
    req.isSuperAdmin = false;
    const hotels = await Hotel.find({ hostId: req.user._id }).select('_id name');
    req.myHotelIds = hotels.map((h) => h._id);
    req.myHotels = hotels;
    return next();
  }

  next();
});

module.exports = tenantGuard;
