import axios from "axios";

// Created a central instance of Axios
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Base URL for all Java Controllers
  withCredentials: true, // Crucial for automatic secure HttpOnly cookie transport
  timeout: 10000, // 10 second timeout to prevent hanging connections
});

api.interceptors.request.use(config => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/google') || error.config?.url?.includes('/auth/register');

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only clear storage and redirect if it's NOT an authentication request
      if (!isAuthRequest) {
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
