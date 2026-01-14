import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateTaskModal from "../components/CreateTaskModal";
import { getAllTasks, adminDeleteTask } from "../api/task.api";
import "./AdminDashboard.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchTasks = async () => {
    const res = await getAllTasks();
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  const creatorLabel = (createdBy) => {
    if (!createdBy) return "Unknown";
    if (createdBy._id === currentUser?.id) return "You";
    return createdBy.name;
  };

  const labelForUser = (user) => {
    if (!user) return null;
    if (user._id === currentUser?.id) return "You";
    return user.name;
  };

  const avatarChar = (user) => user?.name?.charAt(0).toUpperCase() || "";

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <button className="create-btn" onClick={() => setShowCreate(true)}>
          + Create Task
        </button>

        <div className="board">
          {STATUSES.map((status) => (
            <div key={status} className="column">
              <h3>{status.replace("_", " ")}</h3>

              {grouped[status]?.map((task) => (
                <div key={task._id} className="task-card admin">
                  <div className="task-title">{task.title}</div>

                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}

                  <div className="task-meta">
                    Assigned to: {task.assignedTo?.name || "Unassigned"}
                  </div>

                  {task.dueDate && (
                    <small className="task-meta">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </small>
                  )}

                  <div className="task-footer">
                    <div className="creator">
                      <div className="avatar">
                        {creatorLabel(task.createdBy).charAt(0).toUpperCase()}
                      </div>
                      <span className="creator-name">
                        {creatorLabel(task.createdBy)}
                      </span>
                    </div>

                    {/* UPDATED BY (ONLY IF EXISTS) */}
                    {task.updatedBy && (
                      <div className="user-meta">
                        <div className="avatar secondary">
                          {avatarChar(task.updatedBy)}
                        </div>
                        <span className="user-name">
                          Updated by {labelForUser(task.updatedBy)}
                        </span>
                      </div>
                    )}

                    <div className="actions">
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

        {showCreate && (
          <CreateTaskModal
            mode="create"
            onClose={() => setShowCreate(false)}
            onCreated={fetchTasks}
          />
        )}

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
