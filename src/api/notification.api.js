import api from "./axios";

export const getMyNotifications = () =>
  api.get("/api/v1/notifications/notifications/my");

export const markNotificationRead = (id) =>
  api.patch(`/api/v1/notifications/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch("/api/v1/notifications/notifications/read-all");