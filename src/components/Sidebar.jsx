export default function Sidebar() {
  return (
    <div className="sidebar">
      <h1 className="logo">Task Assigner</h1>

      <nav>
        <a className="active">Dashboard</a>
        <a>My Tasks</a>
        <a>Admin</a>
      </nav>
    </div>
  );
}
