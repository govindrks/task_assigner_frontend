import { useEffect, useState } from "react";
import {
  adminCreateTask,
  adminUpdateTaskById,
  updateMyTaskPriority,
} from "../api/task.api";
import { getAllUsers } from "../api/user.api";
import "./CreateTaskModal.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function CreateTaskModal({
  onClose,
  onCreated,
  mode = "create",
  task = null,
}) {
  const [users, setUsers] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assignedTo: "",
    dueDate: "",
  });

  const isAdmin = currentUser?.role === "ADMIN";

  /* ================= FETCH USERS (ADMIN ONLY) ================= */
  useEffect(() => {
    if (isAdmin) {
      getAllUsers().then((res) => setUsers(res.data));
    }
  }, [isAdmin]);

  /* ================= PREFILL FOR EDIT ================= */
  useEffect(() => {
    if (mode === "edit" && task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        assignedTo: task.assignedTo?._id || "",
        dueDate: task.dueDate
          ? task.dueDate.split("T")[0]
          : "",
      });
    }
  }, [mode, task]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "edit") {
      if (isAdmin) {
        // Admin can update everything
        const payload = {
          title: form.title,
          description: form.description || undefined,
          status: form.status,
          priority: form.priority,
          assignedTo: form.assignedTo || null,
          dueDate: form.dueDate || undefined,
        };
        await adminUpdateTaskById(task._id, payload);
      } else {
        //  User can update ONLY priority
        await updateMyTaskPriority(task._id, form.priority);
      }
    } else {
      // Create (Admin only)
      const payload = {
        title: form.title,
        description: form.description || undefined,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || undefined,
      };
      await adminCreateTask(payload);
    }

    onCreated();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>
          {mode === "edit"
            ? isAdmin
              ? "Edit Task"
              : "Update Priority"
            : "Create Task"}
        </h2>

        <input
          name="title"
          placeholder="Task title"
          value={form.title}
          disabled={mode === "edit" && !isAdmin}
          required
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Task description"
          value={form.description}
          disabled={mode === "edit" && !isAdmin}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          disabled={mode === "edit" && !isAdmin}
          onChange={handleChange}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        {/* PRIORITY (Always editable) */}
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {isAdmin && (
          <select
            name="assignedTo"
            value={form.assignedTo}
            disabled={mode === "edit" && !isAdmin}
            onChange={handleChange}
          >
            <option value="">Assign to user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        )}

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          disabled={mode === "edit" && !isAdmin}
          onChange={handleChange}
        />

        {!isAdmin && mode === "edit" && (
          <small className="info-text">
            You can only update task priority
          </small>
        )}

        <div className="modal-actions">
          <button type="submit">
            {mode === "edit"
              ? isAdmin
                ? "Update Task"
                : "Update Priority"
              : "Create"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
