import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// URLs
export const urlAPI = {
  create: (data) => api.post('/urls', data),
  getAll: (params) => api.get('/urls', { params }),
  getOne: (id) => api.get(`/urls/${id}`),
  update: (id, data) => api.put(`/urls/${id}`, data),
  delete: (id) => api.delete(`/urls/${id}`),
  getStats: () => api.get('/urls/stats/overview')
};

// Analytics
export const analyticsAPI = {
  getUrlAnalytics: (urlId) => api.get(`/analytics/${urlId}`),
  getOverview: () => api.get('/analytics/overview')
};

export default api;
