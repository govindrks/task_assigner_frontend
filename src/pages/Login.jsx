import { useState } from "react";
import { loginApi } from "../api/auth.api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
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
    const res = await loginApi(form);

    const { token, user } = res.data.data;

    //  SAVE BOTH
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // OPTIONAL redirect (ex: accept-invite link flow)
    const redirect = new URLSearchParams(location.search).get("redirect");
    const safeRedirect =
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//") &&
      !redirect.includes("://")
        ? redirect
        : null;

    if (safeRedirect) {
      navigate(safeRedirect, { replace: true });
    } else if (user.role === "ADMIN") {
      // ROLE-BASED REDIRECT
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Task Assigner</h1>
        <p>Log in to your account</p>

        {error && <div className="error">{error}</div>}

        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
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
          {loading ? "Logging in..." : "Login"}
        </button>

        <span className="footer-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </span>
      </form>
    </div>
  );
}
