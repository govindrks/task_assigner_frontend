import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import CreateTaskModal from "../components/CreateTaskModal";
import {
  deleteTask,
  getTasks,
  updateTask,
} from "../api/task.api";
import { selectTenantApi } from "../api/auth.api";
import { getMyOrganizations } from "../api/organization.api";
import "./Dashboard.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const PRIORITY_ORDER = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  /* ================= USER ================= */
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  /* ================= CHECK ADMIN ================= */
  const isOrgAdminForSelected = useMemo(() => {
    if (!currentUser || !selectedOrgId) return false;

    const org = organizations.find((o) => o._id === selectedOrgId);
    if (!org) return false;

    return org.createdBy === currentUser.id;
  }, [currentUser, organizations, selectedOrgId]);

  /* ================= FETCH ORGS ================= */
  const fetchOrganizations = async () => {
    try {
      const res = await getMyOrganizations();
      setOrganizations(res.data || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH TASKS ================= */
  const fetchTasks = async (orgId = selectedOrgId) => {
    if (!orgId) return;

    try {
      const res = await getTasks(orgId);
      setTasks(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  /* ================= AUTO SELECT ORG ================= */
  useEffect(() => {
    if (!organizations.length || selectedOrgId) return;

    const saved = localStorage.getItem("selectedOrgId");
    const first =
      organizations.find((o) => o._id === saved)?._id ||
      organizations[0]._id;

    setSelectedOrgId(first);
  }, [organizations, selectedOrgId]);

  /* ================= SYNC TENANT + FETCH ================= */
  useEffect(() => {
    if (!selectedOrgId) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await selectTenantApi(selectedOrgId);
        const token = res?.data?.token;
        if (token) localStorage.setItem("token", token);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) fetchTasks(selectedOrgId);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedOrgId]);

  /* ================= GROUP TASKS ================= */
  // 🔥 backend already filters org — do NOT filter again
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

  /* ================= DRAG ================= */
  const onDragStart = (task) => setDraggedTask(task);

  const onDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggedTask._id ? { ...t, status } : t
      )
    );

    try {
      await updateTask(draggedTask._id, { status });
    } catch {
      fetchTasks();
    }

    setDraggedTask(null);
  };

  /* ================= DELETE ================= */
  const handleDeleteTask = async (taskId) => {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;

    try {
      await deleteTask(taskId, selectedOrgId);
      fetchTasks(selectedOrgId);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= HELPERS ================= */
  const avatarChar = (user) =>
    user?.name?.charAt(0).toUpperCase() || "?";

  const createdByLabel = (user) =>
    user?._id === currentUser?.id ? "You" : user?.name || "Unknown";

  const updatedByLabel = (user) =>
    user?._id === currentUser?.id ? "You" : user?.name;

  /* ================= RENDER ================= */
  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <Navbar />

        {/* ================= ORG SELECT ================= */}
        {organizations.length > 0 && (
          <div className="organizations-section">
            <h2>Select Organization</h2>

            <select
              value={selectedOrgId || ""}
              onChange={(e) => {
                localStorage.setItem("selectedOrgId", e.target.value);
                setSelectedOrgId(e.target.value);
              }}
              className="org-dropdown"
            >
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ================= CREATE BUTTON ================= */}
        <button
          className="create-btn"
          onClick={() => setShowCreate(true)}
        >
          + Create Task
        </button>

        {/* ================= BOARD ================= */}
        <div className="board">
          {STATUSES.map((status) => (
            <div
              key={status}
              className="column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(status)}
            >
              <h3>{status.replace("_", " ")}</h3>

              {grouped[status]?.map((task) => (
                <div
                  key={task._id}
                  className="task-card"
                  draggable
                  onDragStart={() => onDragStart(task)}
                  onClick={() => setEditingTask(task)}
                >
                  {/* ADMIN DELETE BUTTON */}
                  {isOrgAdminForSelected && (
                    <button
                      className="task-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task._id);
                      }}
                    >
                      🗑️
                    </button>
                  )}

                  <h4>{task.title}</h4>

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

        {/* ================= MODALS ================= */}
        {showCreate && (
          <CreateTaskModal
            mode="create"
            onClose={() => setShowCreate(false)}
            onCreated={fetchTasks}
            defaultOrgId={selectedOrgId}
            orgRole={
              isOrgAdminForSelected ? "ORG_ADMIN" : "ORG_MEMBER"
            }
          />
        )}

        {editingTask && (
          <CreateTaskModal
            mode="edit"
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onCreated={fetchTasks}
            defaultOrgId={selectedOrgId}
            orgRole={
              isOrgAdminForSelected ? "ORG_ADMIN" : "ORG_MEMBER"
            }
          />
        )}
      </div>
    </div>
  );
}
