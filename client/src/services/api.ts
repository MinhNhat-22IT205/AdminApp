import axios from 'axios';
import { getToken } from '../stores/useAuthStore';

export const API_BASE = 'http://192.168.1.18:4000'; 

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log('API Error Response:', error.response.data);
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error in setup:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

