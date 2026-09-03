import axiosInstance from './axios';

// 1. Thống kê Analytics
export const getAnalytics = async () => {
  const res = await axiosInstance.get('/admin/analytics');
  return res.data;
};

// 2. Lễ tân Check-in / Check-out & Đặt phòng
export const lookupBooking = async (code) => {
  const res = await axiosInstance.get(`/admin/bookings/lookup?code=${encodeURIComponent(code)}`);
  return res.data;
};

export const checkInBooking = async (id) => {
  const res = await axiosInstance.patch(`/admin/bookings/${id}/check-in`);
  return res.data;
};

export const checkOutBooking = async (id) => {
  const res = await axiosInstance.patch(`/admin/bookings/${id}/check-out`);
  return res.data;
};

export const getAllBookings = async (params = {}) => {
  const res = await axiosInstance.get('/admin/bookings', { params });
  return res.data;
};

// 3. Quản lý Khách sạn
export const getAdminHotels = async () => {
  const res = await axiosInstance.get('/admin/hotels');
  return res.data;
};

export const createHotel = async (data) => {
  const res = await axiosInstance.post('/admin/hotels', data);
  return res.data;
};

export const updateHotel = async (id, data) => {
  const res = await axiosInstance.put(`/admin/hotels/${id}`, data);
  return res.data;
};

export const toggleHotelStatus = async (id) => {
  const res = await axiosInstance.patch(`/admin/hotels/${id}/toggle-status`);
  return res.data;
};

// 4. Quản lý Phòng
export const getAdminRooms = async (hotelId) => {
  const res = await axiosInstance.get('/admin/rooms', { params: hotelId ? { hotelId } : {} });
  return res.data;
};

export const createRoom = async (data) => {
  const res = await axiosInstance.post('/admin/rooms', data);
  return res.data;
};

export const updateRoom = async (id, data) => {
  const res = await axiosInstance.put(`/admin/rooms/${id}`, data);
  return res.data;
};

export const toggleRoomStatus = async (id) => {
  const res = await axiosInstance.patch(`/admin/rooms/${id}/toggle-status`);
  return res.data;
};

// 5. Quản lý Voucher
export const getAdminVouchers = async () => {
  const res = await axiosInstance.get('/admin/vouchers');
  return res.data;
};

export const createVoucher = async (data) => {
  const res = await axiosInstance.post('/admin/vouchers', data);
  return res.data;
};

export const updateVoucher = async (id, data) => {
  const res = await axiosInstance.put(`/admin/vouchers/${id}`, data);
  return res.data;
};

export const deleteVoucher = async (id) => {
  const res = await axiosInstance.delete(`/admin/vouchers/${id}`);
  return res.data;
};
