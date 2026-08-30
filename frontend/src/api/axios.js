import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('hostay_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
