import axios from "axios";

// Created a central instance of Axios
const api = axios.create({
  baseURL: "http://localhost:8080/api", //Base URL for all Java Controllers
});

api.interceptors.request.use(config => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default api;
