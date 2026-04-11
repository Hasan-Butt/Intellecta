import axios from "axios";

// Created a central instance of Axios
const api = axios.create({
  baseURL: "http://localhost:8080/api", // The base URL for all Java controllers
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
