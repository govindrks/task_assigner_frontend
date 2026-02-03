import api from "./axios";

export const registerApi = (payload) =>
  api.post("/auth/register", payload);

export const loginApi = (payload) =>
  api.post("/auth/login", payload);

export const selectTenantApi = (organizationId) =>
  api.post("/auth/select-tenant", { organizationId });
