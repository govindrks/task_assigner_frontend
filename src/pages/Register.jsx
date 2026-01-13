import { useState } from "react";
import { registerApi } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerApi(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* LEFT – FORM */}
      <div className="auth-left">
        <form className="register-card" onSubmit={handleSubmit}>
          <h1 className="brand">Task Assigner</h1>
          <p className="subtitle">Create your account</p>

          {error && <div className="error">{error}</div>}

          <label>Name</label>
          <input
            name="name"
            placeholder="John Doe"
            required
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            onChange={handleChange}
          />

          <button disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="footer-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>

      {/* RIGHT – BLACK PANEL */}
      <div className="auth-right">
        <h1>Organize work.</h1>
        <h1>Assign faster.</h1>

        <p className="tagline">
          A simple Jira-like task management system for teams and admins.
        </p>

        <ul className="features">
          <li>✔ Assign tasks to users</li>
          <li>✔ Track task status easily</li>
          <li>✔ Admin-controlled access</li>
        </ul>
      </div>
    </div>
  );
}
