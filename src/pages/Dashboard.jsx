import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateTaskModal from "../components/CreateTaskModal";
import { getMyTasks, updateTaskStatus } from "../api/task.api";
import "./Dashboard.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH TASKS ================= */

  const fetchTasks = async () => {
    const res = await getMyTasks();
    setTasks(res.data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);



  /* ================= GROUP BY STATUS ================= */

  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  /* ================= DRAG & DROP ================= */

  const onDragStart = (task) => {
    setDraggedTask(task);
  };

  const onDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggedTask._id ? { ...t, status } : t))
    );

    // Backend sync
    try {
      await updateTaskStatus(draggedTask._id, status);
    } catch (err) {
      console.error("Failed to update status");
      fetchTasks(); // rollback
    }

    setDraggedTask(null);
  };

  /* ================= SAFE HELPERS ================= */

  const getUserName = (createdBy) => {
  if (!createdBy) return "Unknown";
    if (createdBy._id === currentUser?.id) return "You";
    return createdBy.name;
}


  const getAvatarChar = (user) => {
    if (!user) return "?";
    if (typeof user === "string") return "U";
    return user.name?.charAt(0).toUpperCase() || "U";
  };

  const labelForUser = (user) => {
    if (!user) return null;
    if (user._id === currentUser?.id) return "You";
    return user.name;
  };

  const avatarChar = (user) =>
  user?.name?.charAt(0).toUpperCase() || "?";

  /* ================= RENDER ================= */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        {/* USER CREATE TASK */}
        <button className="create-btn" onClick={() => setShowModal(true)}>
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
                >
                  <h4>{task.title}</h4>

                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}

                  {task.dueDate && (
                    <small className="due-date">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </small>
                  )}

                  {/* Jira-like footer */}
                  <div className="task-footer">
                    <div className="creator">
                      Created by: {task.createdBy ? getUserName(task.createdBy) : "You"}
                    </div>

                    <div className="avatar">
                      {getAvatarChar(task.assignedTo)}
                    </div>
                  </div>
                  {/* UPDATED BY (ONLY IF EXISTS) */}
                    {task.updatedBy && (
                      <div className="user-meta">
                        <div className="avatar secondary">
                          {avatarChar(task.updatedBy)}
                        </div>
                        <span className="user-name">
                          Updated by:- {labelForUser(task.updatedBy)}
                        </span>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {showModal && (
          <CreateTaskModal
            onClose={() => setShowModal(false)}
            onCreated={fetchTasks}
          />
        )}
      </div>
    </div>
  );
}
