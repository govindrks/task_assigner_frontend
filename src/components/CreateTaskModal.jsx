import { useEffect, useState } from "react";
import {
  adminCreateTask,
  adminUpdateTaskById,
} from "../api/task.api";
import { getAllUsers } from "../api/user.api";
import "./CreateTaskModal.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export default function CreateTaskModal({
  onClose,
  onCreated,
  mode = "create", // "create" | "edit"
  task = null,
}) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    assignedTo: "",
    dueDate: "",
  });

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    getAllUsers().then((res) => setUsers(res.data));
  }, []);

  /* ================= PREFILL FOR EDIT ================= */
  useEffect(() => {
    if (mode === "edit" && task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
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

    const payload = {
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      assignedTo: form.assignedTo || null,
      dueDate: form.dueDate || undefined,
    };

    if (mode === "edit") {
      await adminUpdateTaskById(task._id, payload);
    } else {
      await adminCreateTask(payload);
    }

    onCreated();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>{mode === "edit" ? "Edit Task" : "Create Task"}</h2>

        <input
          name="title"
          placeholder="Task title"
          value={form.title}
          required
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Task description"
          value={form.description}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
        >
          <option value="">Assign to user</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button type="submit">
            {mode === "edit" ? "Update" : "Create"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
