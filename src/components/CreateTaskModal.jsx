import { useCallback, useEffect, useState, useMemo } from "react";
import {
  createTask,
  updateTask,
  deleteTask,
} from "../api/task.api";
import { addTaskComment, getTaskComments } from "../api/activity.api";
import {
  getMyOrganizations,
  getOrganizationMembers,
} from "../api/organization.api";
import "./CreateTaskModal.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function CreateTaskModal({
  onClose,
  onCreated,
  mode = "create",
  task = null,
  defaultOrgId = null,
  orgRole,
}) {
  const isAdmin = orgRole === "ORG_ADMIN";

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [organizations, setOrganizations] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [commentSaving, setCommentSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assignedTo: currentUser?.id || "",
    dueDate: "",
    organizationId: defaultOrgId || "",
  });

  /* ================= LOAD ORGANIZATIONS (ADMIN ONLY) ================= */
  useEffect(() => {
    if (!isAdmin) return;

    getMyOrganizations()
      .then((res) => {
        const orgs = res.data || res;
        setOrganizations(orgs || []);
      })
      .catch(() => setOrganizations([]));
  }, [isAdmin]);

  /* ================= LOAD MEMBERS (EVERYONE) ================= */
  useEffect(() => {
    if (!form.organizationId) return;

    getOrganizationMembers(form.organizationId)
      .then((res) => {
        const members = res.data || res.members || [];
        setOrgMembers(members);
      })
      .catch(() => setOrgMembers([]));
  }, [form.organizationId]);

  /* ================= PREFILL EDIT ================= */
  useEffect(() => {
    if (mode === "edit" && task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        assignedTo: task.assignedTo?._id || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        organizationId: task.organization?._id || task.organization || "",
      });
    }
  }, [mode, task]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COMMENTS (EDIT MODE ONLY) ================= */
  const refreshComments = useCallback(async (taskId) => {
    if (!taskId) return;
    try {
      const res = await getTaskComments(taskId);
      const list = Array.isArray(res) ? res : res.data || [];
      setComments(list);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setComments([]);
    }
  }, []);

  useEffect(() => {
    setCommentText("");
    setCommentError(null);
    setComments([]);

    if (mode !== "edit") return;
    refreshComments(task?._id);
  }, [mode, refreshComments, task?._id]);

  const handleAddComment = async () => {
    if (mode !== "edit" || !task?._id) return;

    const message = commentText.trim();
    if (!message) return;

    setCommentSaving(true);
    setCommentError(null);

    try {
      await addTaskComment(task._id, message);
      setCommentText("");
      await refreshComments(task._id);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add comment";
      setCommentError(msg);
    } finally {
      setCommentSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || mode !== "edit" || !task?._id) return;

    const ok = window.confirm("Delete this task? This cannot be undone.");
    if (!ok) return;

    await deleteTask(task._id);
    onCreated();
    onClose();
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      assignedTo: form.assignedTo || null,
      dueDate: form.dueDate || undefined,
      organizationId: form.organizationId || undefined,
    };

    if (mode === "edit") {
      await updateTask(task._id, payload);
    } else {
      await createTask(payload);
    }

    onCreated();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}  // prevent overlay close
      >
        {/* CLOSE BUTTON */}
      <button
        type="button"
        className="modal-close-btn"
        onClick={onClose}
      >
        ❌
      </button>

        <h2>{mode === "edit" ? "Edit Task" : "Create Task"}</h2>

        {/* ORGANIZATION (ADMIN ONLY) */}
        {isAdmin && mode === "create" && (
          <select
            name="organizationId"
            value={form.organizationId}
            onChange={handleChange}
            required
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        )}

        {/* TITLE */}
        <input
          name="title"
          placeholder="Task title"
          value={form.title}
          onChange={handleChange}
          required
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Task description"
          value={form.description}
          onChange={handleChange}
        />

        {/* STATUS */}
        <select name="status" value={form.status} onChange={handleChange}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        {/* PRIORITY */}
        <select name="priority" value={form.priority} onChange={handleChange}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* ✅ MEMBERS LIST FOR ASSIGNMENT */}
        <select
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
        >
          <option value="">Unassigned</option>

          {/* Self */}
          <option value={currentUser?.id}>Me</option>

          {orgMembers.map((m) => (
            <option key={m.user?._id || m._id} value={m.user?._id || m._id}>
              {(m.user?.name || m.name)} ({m.user?.email || m.email})
            </option>
          ))}
        </select>

        {/* DUE DATE */}
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />

        <div className="modal-actions">
          {isAdmin && mode === "edit" && (
            <button
              type="button"
              className="danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
          <button type="submit">
            {mode === "edit" ? "Update Task" : "Create Task"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>

        {/* ================= COMMENTS (EDIT MODE) ================= */}
        {mode === "edit" && task?._id && (
          <div className="comments-section">
            <h3>Comments</h3>

            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            {commentError && (
              <div className="comment-error">
                {commentError}
              </div>
            )}

            <div className="comment-actions">
              <button
                type="button"
                onClick={handleAddComment}
                disabled={commentSaving || !commentText.trim()}
              >
                {commentSaving ? "Adding..." : "Add Comment"}
              </button>
            </div>

            <div className="comment-list">
              {comments.length === 0 && (
                <div className="comment-empty">
                  No comments yet
                </div>
              )}

              {comments.map((c) => (
                <div key={c._id} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">
                      {c.performedBy?.name || "Someone"}
                    </span>
                    <span>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>

                  <div className="comment-message">
                    {c.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
