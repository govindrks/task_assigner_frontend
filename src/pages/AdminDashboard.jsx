import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateTaskModal from "../components/CreateTaskModal";
import { getTasks, deleteTask } from "../api/task.api";
import { getMyOrganizations } from "../api/organization.api";
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
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  }, []);

  /* ================= FETCH TASKS AND ORGANIZATIONS ================= */

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTasks();
      // handle various response shapes: array, { data: [...] }, { data: { data: [...] } }
      const tasksArr = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setTasks(tasksArr);
    } catch (err) {
      console.error("Failed to fetch admin tasks", err);
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await getMyOrganizations();
      let orgs = [];
      if (Array.isArray(res)) {
        orgs = res;
      } else if (Array.isArray(res.data)) {
        orgs = res.data;
      }
      setOrganizations(orgs || []);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setOrganizations([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchOrganizations();
  }, []);

  // Auto-select first organization when organizations are loaded
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0]._id);
    }
  }, [organizations]);

  /* ================= GROUP BY STATUS + SORT BY PRIORITY ================= */

  // Filter tasks by selected organization and check if admin is member
  const filteredTasks = selectedOrgId
    ? tasks.filter((t) => {
        const taskOrgId = t.organization?._id || t.organization;
        // Check if task belongs to selected org
        if (taskOrgId !== selectedOrgId) return false;
        // Check if current user is admin of this organization
        const selectedOrg = organizations.find(o => o._id === selectedOrgId);
        if (!selectedOrg) return false;
        // Check if current user is in organization members (admin of org)
        const isOrgAdmin = selectedOrg.members?.some(m => m._id === currentUser?.id) || 
                          selectedOrg.admin?._id === currentUser?.id;
        return isOrgAdmin;
      })
    : [];

  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = filteredTasks
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

        {/* ORGANIZATIONS FILTER SECTION */}
        {organizations.length > 0 && (
          <div className="organizations-section">
            <h2>Select Organization to Manage</h2>
            <div className="org-filter">
              <select 
                value={selectedOrgId || ""} 
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="org-dropdown"
              >
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.members?.length || 0} members)
                  </option>
                ))}
              </select>
            </div>
            
            {/* ORGANIZATION DETAILS */}
            {selectedOrgId && organizations.find(o => o._id === selectedOrgId) && (
              <div className="org-details">
                <div key={selectedOrgId} className="org-card">
                  <h3>{organizations.find(o => o._id === selectedOrgId)?.name}</h3>
                  {organizations.find(o => o._id === selectedOrgId)?.description && (
                    <p>{organizations.find(o => o._id === selectedOrgId)?.description}</p>
                  )}
                  <small>{organizations.find(o => o._id === selectedOrgId)?.members?.length || 0} members</small>
                </div>
              </div>
            )}
          </div>
        )}

        <button className="create-btn" onClick={() => setShowCreate(true)}>
          + Create Task
        </button>

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Loading tasks...</div>}

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
                          deleteTask(task._id).then(fetchTasks)
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
            defaultOrgId={selectedOrgId}
            orgRole="ORG_ADMIN"
          />
        )}

        {/* EDIT TASK */}
        {editingTask && (
          <CreateTaskModal
            mode="edit"
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onCreated={fetchTasks}
              orgRole="ORG_ADMIN"
          />
        )}
      </div>
    </div>
  );
}
