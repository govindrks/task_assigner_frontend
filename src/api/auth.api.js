import api from "./axios";

export const registerApi = (payload) => {
  return api.post("/api/auth/register", payload);
};

export const loginApi = (payload) => {
  return api.post("/api/auth/login", payload);
};
