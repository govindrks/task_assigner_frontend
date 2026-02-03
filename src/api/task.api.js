// import api from "./axios";

// /* ================= TASKS ================= */

// /**
//  * Get tasks
//  * - Admin → all org tasks
//  * - Member → assigned tasks only
//  * (organizationId required as query param)
//  */
// export const getTasks = (organizationId) =>
//   api.get("/api/tasks", {
//     params: { organizationId },
//   });

// /**
//  * Create task
//  * - ORG_ADMIN only (backend enforced)
//  */
// export const createTask = async (payload) => {
//   const res = await api.post("/api/tasks", payload);
//   return res.data;
// };

// /**
//  * Update task
//  * - Admin → any field
//  * - Member → priority only
//  */
// export const updateTask = async (taskId, payload) => {
//   const res = await api.patch(`/api/tasks/${taskId}`, payload);
//   return res.data;
// };

// /**
//  * Mark task as done
//  * - Assigned user only
//  */
// export const markTaskDone = async (taskId) => {
//   const res = await api.patch(`/api/tasks/${taskId}/mark-done`);
//   return res.data;
// };

// /**
//  * Delete task
//  * - ORG_ADMIN only
//  */
// export const deleteTask = async (taskId) => {
//   const res = await api.delete(`/api/tasks/${taskId}`);
//   return res.data;
// };

import api from "./axios";

export const createTask = (payload) =>
  api.post("/api/v1/tasks/tasks", payload);

// export const getTasks = () =>
//   api.get("/tasks/tasks");

export const getTasks = (orgId) =>
  api.get(orgId ? `/api/v1/tasks/tasks?organizationId=${orgId}` : "/api/v1/tasks/tasks");


export const updateTask = (id, payload) =>
  api.patch(`/api/v1/tasks/tasks/${id}`, payload);
export const deleteTask = (id) =>
  api.delete(`/api/v1/tasks/tasks/${id}`);

export const markTaskDone = (id) =>
  api.patch(`/api/v1/tasks/tasks/${id}/mark-done`);
