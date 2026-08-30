import axiosInstance from './axios';

export const searchHotels = async (params) => {
  const response = await axiosInstance.get('/hotels/search', { params });
  return response.data;
};
