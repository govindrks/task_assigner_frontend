import api from "./axios";

// Admin: get all users for assignment dropdown
export const getAllUsers = () =>
  api.get("/api/v1/admin/users");
