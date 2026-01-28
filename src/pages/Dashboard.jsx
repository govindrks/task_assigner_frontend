import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateTaskModal from "../components/CreateTaskModal";
import { getMyTasks, updateTaskStatus } from "../api/task.api";
import "./Dashboard.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const PRIORITY_ORDER = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH TASKS ================= */

  const fetchTasks = async () => {
    const res = await getMyTasks();
    setTasks(res.data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ================= GROUP BY STATUS + SORT BY PRIORITY ================= */

  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = tasks
      .filter((t) => t.status === status)
      .sort(
        (a, b) =>
          (PRIORITY_ORDER[b.priority] || 0) -
          (PRIORITY_ORDER[a.priority] || 0)
      );
    return acc;
  }, {});

  /* ================= DRAG & DROP ================= */

  const onDragStart = (task) => {
    setDraggedTask(task);
  };

  const onDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return;

    // Optimistic UI
    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggedTask._id ? { ...t, status } : t
      )
    );

    try {
      await updateTaskStatus(draggedTask._id, status);
    } catch {
      fetchTasks(); // rollback
    }

    setDraggedTask(null);
  };

  /* ================= HELPERS ================= */

  const createdByLabel = (user) => {
    if (!user) return "Unknown";
    if (user._id === currentUser?.id) return "You";
    return user.name;
  };

  const updatedByLabel = (user) => {
    if (!user) return null;
    if (user._id === currentUser?.id) return "You";
    return user.name;
  };

  const avatarChar = (user) =>
    user?.name?.charAt(0).toUpperCase() || "?";

  /* ================= RENDER ================= */

  return (
    <div className="dashboard-layout">

      <div className="dashboard-main">
        <Navbar />

        {/* CREATE TASK */}
        <button className="create-btn" onClick={() => setShowCreate(true)}>
          + Create Task
        </button>

        <div className="board">
          {STATUSES.map((status) => (
            <div
              key={status}
              className="column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(status)}
            >
              <h3>{status.replace("_", " ")}</h3>

              {grouped[status]?.length === 0 && (
                <p className="empty">No tasks</p>
              )}

              {grouped[status]?.map((task) => (
                <div
                  key={task._id}
                  className="task-card"
                  draggable
                  onDragStart={() => onDragStart(task)}
                  onClick={() => setEditingTask(task)}
                >
                  <h4>{task.title}</h4>

                  {/* 🔥 PRIORITY BADGE */}
                  {task.priority && (
                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  )}

                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}

                  {task.dueDate && (
                    <small className="due-date">
                      Due:{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </small>
                  )}

                  {/* FOOTER */}
                  <div className="task-footer">
                    <div className="user-meta">
                      <div className="avatar">
                        {avatarChar(task.createdBy)}
                      </div>
                      <span>
                        Created by {createdByLabel(task.createdBy)}
                      </span>
                    </div>

                    {task.updatedBy && (
                      <div className="user-meta">
                        <div className="avatar secondary">
                          {avatarChar(task.updatedBy)}
                        </div>
                        <span>
                          Updated by {updatedByLabel(task.updatedBy)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CREATE MODAL */}
        {showCreate && (
          <CreateTaskModal
            mode="create"
            onClose={() => setShowCreate(false)}
            onCreated={fetchTasks}
          />
        )}

        {/* EDIT MODAL */}
        {editingTask && (
          <CreateTaskModal
            mode="edit"
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onCreated={fetchTasks}
          />
        )}
      </div>
    </div>
  );
}
