import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateTaskModal from "../components/CreateTaskModal";
import { getAllTasks, adminDeleteTask } from "../api/task.api";
import "./AdminDashboard.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const PRIORITY_ORDER = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH TASKS ================= */

  const fetchTasks = async () => {
    const res = await getAllTasks();
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

  /* ================= HELPERS ================= */

  const creatorLabel = (user) => {
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

        <button className="create-btn" onClick={() => setShowCreate(true)}>
          + Create Task
        </button>

        <div className="board">
          {STATUSES.map((status) => (
            <div key={status} className="column">
              <h3>{status.replace("_", " ")}</h3>

              {grouped[status]?.length === 0 && (
                <p className="empty">No tasks</p>
              )}

              {grouped[status]?.map((task) => (
                <div
                  key={task._id}
                  className="task-card admin"
                  onClick={() => setEditingTask(task)} // Admin can edit including priority
                >
                  <div className="task-title">{task.title}</div>

                  {/*  PRIORITY BADGE */}
                  {task.priority && (
                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                      title="Click to update"
                    >
                      {task.priority}
                    </span>
                  )}

                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}

                  <div className="task-meta">
                    Assigned to:{" "}
                    {task.assignedTo?.name || "Unassigned"}
                  </div>

                  {task.dueDate && (
                    <small className="task-meta">
                      Due:{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </small>
                  )}

                  {/* FOOTER */}
                  <div className="task-footer">
                    <div className="creator">
                      <div className="avatar">
                        {avatarChar(task.createdBy)}
                      </div>
                      <span className="creator-name">
                        {creatorLabel(task.createdBy)}
                      </span>
                    </div>

                    {task.updatedBy && (
                      <div className="user-meta">
                        <div className="avatar secondary">
                          {avatarChar(task.updatedBy)}
                        </div>
                        <span className="user-name">
                          Updated by {updatedByLabel(task.updatedBy)}
                        </span>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div
                      className="actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="icon edit"
                        title="Edit Task"
                        onClick={() => setEditingTask(task)}
                      >
                        ✏️
                      </span>

                      <span
                        className="icon delete"
                        title="Delete Task"
                        onClick={() =>
                          adminDeleteTask(task._id).then(fetchTasks)
                        }
                      >
                        🗑️
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CREATE TASK */}
        {showCreate && (
          <CreateTaskModal
            mode="create"
            onClose={() => setShowCreate(false)}
            onCreated={fetchTasks}
          />
        )}

        {/* EDIT TASK */}
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
