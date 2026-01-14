import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h2>Dashboard</h2>

      {user && (
        <div className="navbar-user">
          <span>
            👤 {user.name} ({user.role})
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
