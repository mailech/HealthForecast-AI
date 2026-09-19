import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hf_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return Promise.reject(
        new Error(
          'Cannot connect to backend. Please make sure FastAPI is running on http://127.0.0.1:8000'
        )
      );
    }

    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      return Promise.reject(
        new Error(detail.map((item) => item.msg).join(', '))
      );
    }

    return Promise.reject(
      new Error(detail || error.message || `Request failed with status ${error.response?.status || 'unknown'}`)
    );
  }
);

export default api;