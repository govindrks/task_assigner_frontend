import api from "./axios";

export const registerApi = (payload) =>
  api.post("/api/v1/auth/register", payload);

export const loginApi = (payload) =>
  api.post("/api/v1/auth/login", payload);

export const selectTenantApi = (organizationId) =>
  api.post("/api/v1/auth/select-tenant", { organizationId });
