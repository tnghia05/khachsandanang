import axiosInstance from './axios';

export const getHotelById = async (id) => {
  const res = await axiosInstance.get(`/hotels/${id}`);
  return res.data;
};
