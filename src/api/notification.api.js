import api from "./axios";

export const getMyNotifications = () =>
  api.get("/api/notifications/my");

export const markNotificationRead = (id) =>
  api.patch(`/api/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch("/api/notifications/read-all");
