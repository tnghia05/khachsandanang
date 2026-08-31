import axiosInstance from './axios';

export const createBooking = async (data) => {
  const res = await axiosInstance.post('/bookings', data);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await axiosInstance.get('/bookings/my-bookings');
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await axiosInstance.get(`/bookings/${id}`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await axiosInstance.patch(`/bookings/${id}/cancel`);
  return res.data;
};
