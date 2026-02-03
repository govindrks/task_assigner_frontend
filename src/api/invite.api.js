import api from "./axios";

export const inviteUser = (payload) =>
  api.post("/invites", payload);

export const acceptInvite = (token) =>
  api.post(`/invites/${token}/accept`);
