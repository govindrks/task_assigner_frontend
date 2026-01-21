// import api from "./axios";

// // USER
// export const getMyTasks = () => api.get("/api/tasks/tasks");
// export const updateTaskStatus = (id, status) =>
//   api.put(`/api/tasks/${id}`, { status });

// // ADMIN
// export const getAllTasks = () => api.get("/api/tasks/tasks");

// export const adminCreateTask = (payload) =>
//   api.post("/api/tasks/tasks", payload); // ✅ ADD THIS

// export const adminUpdateStatus = (id, status) =>
//   api.patch(`/api/admin/tasks/${id}/status`, { status });

// export const deleteTask = (id) =>
//   api.delete(`/api/admin/tasks/${id}`);



import api from "./axios";

/* ================= USER ================= */

// Get tasks assigned to logged-in user
export const getMyTasks = () =>
  api.get("/api/tasks/my");

// USER creates task for himself
export const createMyTask = (payload) =>
  api.post("/api/tasks", payload);

// User updates own task (title / status / etc.)
export const updateMyTask = (id, payload) =>
  api.put(`/api/tasks/${id}`, payload);

export const updateMyTaskPriority = (id, priority) =>
  api.put(`/api/tasks/${id}`, { priority });


export const updateTaskStatus = (id, status) =>
  api.put(`/api/tasks/${id}`, { status });

// Mark task as done
export const markTaskDone = (id) =>
  api.patch(`/api/tasks/${id}/mark-done`);

// Delete own task
export const deleteMyTask = (id) =>
  api.delete(`/api/tasks/${id}`);


/* ================= ADMIN ================= */

// Admin: get ALL tasks
export const getAllTasks = () =>
  api.get("/api/admin/tasks");

// Admin: create task and assign user
export const adminCreateTask = (payload) =>
  api.post("/api/admin/tasks", payload);

// Admin: update task status
export const adminUpdateStatus = (id, status) =>
  api.patch(`/api/admin/tasks/${id}/status`, { status });

export const adminUpdateTaskById = (id, payload) =>
  api.put(`/api/admin/tasks/${id}`, payload);

// Admin: delete any task
export const adminDeleteTask = (id) =>
  api.delete(`/api/admin/tasks/${id}`);
