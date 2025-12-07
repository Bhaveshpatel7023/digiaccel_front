import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string; testUrl?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string; testUrl?: string }) =>
    api.post('/auth/login', data),
};

// Test APIs
export const testAPI = {
  getTestByUrl: (uniqueUrl: string) =>
    api.get(`/tests/url/${uniqueUrl}`),
  startTest: (testId: string) =>
    api.post(`/tests/${testId}/start`),
  submitAnswer: (testId: string, questionId: string, selectedAnswer: string) =>
    api.post(`/tests/${testId}/questions/${questionId}/answer`, { selectedAnswer }),
  getTestDetails: (testId: string) =>
    api.get(`/tests/${testId}`),
  getMyTests: () =>
    api.get('/tests/my-tests'),
  generateTestUrl: () =>
    api.post('/tests/generate-url'),
  getAllTests: () =>
    api.get('/tests'),
};

// Question APIs (Admin)
export const questionAPI = {
  getAll: () => api.get('/questions'),
  getById: (id: string) => api.get(`/questions/${id}`),
  create: (data: any) => api.post('/questions', data),
  update: (id: string, data: any) => api.put(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
};

