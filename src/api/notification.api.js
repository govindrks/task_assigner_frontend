import api from "./axios";

export const getMyNotifications = () =>
  api.get("/notifications/notifications/my");

export const markNotificationRead = (id) =>
  api.patch(`/notifications/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch("/notifications/notifications/read-all");