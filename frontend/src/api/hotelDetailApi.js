import axiosInstance from './axios';

export const getHotelById = async (id) => {
  const res = await axiosInstance.get(`/hotels/${id}`);
  return res.data;
};

export const getFeaturedHotels = async () => {
  const res = await axiosInstance.get('/hotels/featured');
  return res.data;
};

