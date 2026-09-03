const AppError = require('../utils/AppError');

/**
 * Middleware kiểm tra hạn thuê bao B2B SaaS của Host:
 * - Super Admin: Bỏ qua kiểm tra.
 * - Host: Kiểm tra hạn dùng (expiresAt) và trạng thái (isActive).
 */
const checkSubscription = (req, res, next) => {
  if (!req.user || req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'host') {
    const sub = req.user.subscription;

    if (!sub || sub.isActive === false) {
      return next(
        new AppError(
          'Tài khoản đối tác của bạn đang bị tạm khóa. Vui lòng liên hệ quản trị viên Hostay.',
          403
        )
      );
    }

    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
      return next(
        new AppError(
          'Gói dịch vụ quản trị PMS của bạn đã hết hạn. Vui lòng gia hạn gói thuê bao để tiếp tục sử dụng.',
          403
        )
      );
    }
  }

  next();
};

module.exports = checkSubscription;
