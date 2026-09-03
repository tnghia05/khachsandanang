import axiosInstance from './axios';

export const applyVoucher = async (data) => {
  const res = await axiosInstance.post('/vouchers/apply', data);
  return res.data;
};

export const getPublicVouchers = async () => {
  const res = await axiosInstance.get('/vouchers/public');
  return res.data;
};
