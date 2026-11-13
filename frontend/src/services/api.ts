import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiBase";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
  timeout: 120000,
});

// Automatically attach admin authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("paciano_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("paciano_admin_token");
    }

    return Promise.reject(error);
  }
);

export default api;
