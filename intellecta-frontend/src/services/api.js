import axios from "axios";

// Created a central instance of Axios
const api = axios.create({
  baseURL: "http://localhost:8080/api", //Base URL for all Java Controllers
});

api.interceptors.request.use(config => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/google') || error.config?.url?.includes('/auth/register');

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only clear storage and redirect if it's NOT an authentication request
      // (because 401 on login just means "wrong password", not "session expired")
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
