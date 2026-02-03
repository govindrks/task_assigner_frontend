import { Link } from "react-router-dom";
import { isAdmin } from "../utils/auth";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Task Assigner</h2>
      {isAdmin() && (
        <>
          <Link to="/admin/dashboard">Admin Dashboard</Link>
          <Link to="/admin/tasks">All Tasks</Link>
          <Link to="/admin/assign">Assign Task</Link>
          <Link to="/create-organization">Create Organization</Link>
          <Link to="/invite-users">Invite Users</Link>
        </>
      )}
      {!isAdmin() && (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/accept-invite">My Invitations</Link>
        </>
      )}
    </aside>
  );
}
