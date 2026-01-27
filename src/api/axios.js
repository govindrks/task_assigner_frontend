import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:5555",
  baseURL: "https://task-assigner-backend-lswo.onrender.com",
  headers: {
    "Cache-Control": "no-cache",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
