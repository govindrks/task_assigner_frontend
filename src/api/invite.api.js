import api from "./axios";

export const inviteUser = (payload) =>
  api.post("/api/v1/invites", payload);

export const acceptInvite = (token) =>
  api.post(`/api/v1/invites/${token}/accept`);
