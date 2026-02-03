import api from "./axios";

export const getTaskActivity = (taskId) =>
  api.get(`/api/v1/activity/tasks/${taskId}/activity`);

export const getTaskComments = (taskId) =>
  api.get(`/api/v1/activity/tasks/${taskId}/comments`);

export const addTaskComment = (taskId, message) =>
  api.post(`/api/v1/activity/tasks/${taskId}/comments`, { message });
