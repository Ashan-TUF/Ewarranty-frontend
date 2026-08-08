import axios from "axios";
import { API_BASE_URL } from "@/lib/api-url";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Future JWT Token
  // config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
