import api from "./axios";

export const getTaskActivity = (taskId) =>
  api.get(`/api/tasks/${taskId}/activity`);
