import api from "./axios";

export const getTaskActivity = (taskId) =>
  api.get(`/activity/tasks/${taskId}/activity`);

export const getTaskComments = (taskId) =>
  api.get(`/activity/tasks/${taskId}/comments`);

export const addTaskComment = (taskId, message) =>
  api.post(`/activity/tasks/${taskId}/comments`, { message });
