import axios from 'axios';

// In production, fallback to Render production backend URL instead of localhost
const defaultBaseUrl = import.meta.env.PROD
  ? 'https://mithuskitchen.onrender.com'
  : 'http://localhost:5000/api/v1';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;
// Strip trailing slashes to guarantee clean endpoint concatenation (e.g. /auth/admin-login)
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const uploadFoodImage = async (file: File): Promise<{ url: string; s3Url: string; fileName: string; path: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  const res: any = await api.post('/foods/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
