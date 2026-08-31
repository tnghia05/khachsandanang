import axiosInstance from './axios';

export const createPaymentUrl = async (bookingId, paymentMethod) => {
  const res = await axiosInstance.post('/payments/create-url', { bookingId, paymentMethod });
  return res.data;
};
