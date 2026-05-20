import axios from 'axios';

// In production (Vercel), use the Render backend URL
// In development, use Vite proxy (/api → localhost:5001)
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — redirect to login
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

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me')
};

export const urlAPI = {
  create:      (data)   => api.post('/urls', data),
  createBulk:  (urls)   => api.post('/urls/bulk', { urls }),
  getAll:      (params) => api.get('/urls', { params }),
  getOne:      (id)     => api.get(`/urls/${id}`),
  update:      (id, data) => api.put(`/urls/${id}`, data),
  delete:      (id)     => api.delete(`/urls/${id}`),
  getStats:    ()       => api.get('/urls/stats/overview')
};

export const analyticsAPI = {
  getUrlAnalytics: (urlId) => api.get(`/analytics/${urlId}`),
  getOverview:     ()      => api.get('/analytics/overview')
};

export default api;
