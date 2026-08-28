import axios from "axios";

// Created a central instance of Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api", // Base URL for all Java Controllers
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 second timeout to prevent hanging connections
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("intellecta_token");
  if (token && !(config.data instanceof FormData)) {
    config.headers.Authorization = `Bearer ${token}`;
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
