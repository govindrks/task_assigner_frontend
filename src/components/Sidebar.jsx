import { Link } from "react-router-dom";
import { isAdmin } from "../utils/auth";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Task Assigner</h2>

      <Link to="/dashboard">My Tasks</Link>

      {isAdmin() && (
        <>
          <Link to="/admin/dashboard">Admin Dashboard</Link>
          <Link to="/admin/tasks">All Tasks</Link>
          <Link to="/admin/assign">Assign Task</Link>
        </>
      )}
    </aside>
  );
}
