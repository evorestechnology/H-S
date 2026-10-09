import axios from 'axios';
import { getPortalToken } from '../services/authStorage';
import { API_BASE_URL } from '../config/apiConfig';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL || '/api',
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getPortalToken() || sessionStorage.getItem('hs_auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.url && config.url.startsWith('/api/') && config.baseURL && config.baseURL.endsWith('/api')) {
    config.url = config.url.replace(/^\/api/, '');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

