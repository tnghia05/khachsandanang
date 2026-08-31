const cron = require('node-cron');
const { expireHoldBookings } = require('../modules/booking/booking.service');

exports.startBookingExpiryJob = () => {
  cron.schedule('*/2 * * * *', async () => {
    try {
      const expiredCount = await expireHoldBookings();
      if (expiredCount > 0) {
        console.log(`[Cron] Expired ${expiredCount} held bookings`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to expire bookings:', error);
    }
  });
  console.log('Booking expiry cron job started');
};
