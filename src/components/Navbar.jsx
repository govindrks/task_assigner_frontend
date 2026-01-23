import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notification.api";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState("ALL");

  /* ================= FETCH NOTIFICATIONS ================= */
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ================= FILTERED NOTIFICATIONS ================= */
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "ALL") return true;
    if (filter === "ASSIGNED") return n.type === "TASK_ASSIGNED";
    if (filter === "UPDATED") return n.type === "TASK_UPDATED";
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  /* ================= ACTIONS ================= */
  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

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
          {/* 🔔 NOTIFICATION BELL */}
          <div className="notification-wrapper">
            <span
              className="bell"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </span>

            {showDropdown && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>

                {/* MARK ALL READ */}
                <button
                  className="mark-all-btn"
                  onClick={handleMarkAllRead}
                >
                  Mark all as read
                </button>

                {/* FILTERS */}
                <div className="notif-filters">
                  {["ALL", "ASSIGNED", "UPDATED", "UNREAD"].map((f) => (
                    <button
                      key={f}
                      className={`filter-btn ${filter === f ? "active" : ""}`}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {filteredNotifications.length === 0 && (
                  <p className="empty">No notifications</p>
                )}

                {filteredNotifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${
                      n.isRead ? "read" : "unread"
                    }`}
                    onClick={() => handleRead(n._id)}
                  >
                    {/* TASK TITLE */}
                    <p className="notif-title">
                      <strong>{n.task?.title}</strong>
                    </p>

                    {/* MESSAGE */}
                    <p>{n.message}</p>

                    {/* FIELD LEVEL CHANGES */}
                    {n.changes?.length > 0 && (
                      <ul className="change-list">
                        {n.changes.map((c, idx) => (
                          <li key={idx}>
                            <strong>{c.field}</strong>:{" "}
                            {String(c.oldValue ?? "N/A")} →{" "}
                            {String(c.newValue ?? "N/A")}
                          </li>
                        ))}
                      </ul>
                    )}

                    <small className="notif-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* USER INFO */}
          <span>
            👤 {user.name} ({user.role})
          </span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
