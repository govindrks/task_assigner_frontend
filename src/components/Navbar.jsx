import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notification.api";
import { getMyOrganizations } from "../api/organization.api";
import "./Navbar.css";
import { acceptInvite } from "../api/invite.api";

export default function Navbar() {
  const navigate = useNavigate();

  /* ================= USER ================= */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  /* ================= STATE ================= */
  const [notifications, setNotifications] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(
    JSON.parse(localStorage.getItem("currentOrganization")) || null
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [filter, setFilter] = useState("ALL");

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    fetchOrganizations();
  }, [user]);

  /* ================= ORGANIZATIONS ================= */
  const fetchOrganizations = async () => {
    try {
      const orgs = await getMyOrganizations();
      const safeOrgs = Array.isArray(orgs) ? orgs : [];

      setOrganizations(safeOrgs);

      const storedOrg = JSON.parse(localStorage.getItem("currentOrganization"));

      const validStored =
        storedOrg && safeOrgs.find((o) => o._id === storedOrg._id);

      if (validStored) {
        setCurrentOrg(validStored);
      } else if (safeOrgs.length > 0) {
        setCurrentOrg(safeOrgs[0]);
        localStorage.setItem("currentOrganization", JSON.stringify(safeOrgs[0]));
        localStorage.setItem("currentOrganizationId", safeOrgs[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= NOTIFICATIONS ================= */
  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ================= FILTER ================= */
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "ALL") return true;
    if (filter === "ASSIGNED") return n.type === "TASK_ASSIGNED";
    if (filter === "UPDATED") return n.type === "TASK_UPDATED";
    if (filter === "INVITES") return n.type === "ORG_INVITE";
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  /* ================= ACTIONS ================= */
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleInviteAccept = async (n) => {
  try {
    const token = n.metadata?.token;

    // accept invite (join org)
    await acceptInvite(token);

    // mark notification read
    await markNotificationRead(n._id);

    // refresh orgs so new org appears
    await fetchOrganizations();

    //refresh notifications
    await fetchNotifications();

    setShowDropdown(false);

  } catch (err) {
    console.error("Invite accept failed:", err);
  }
};


  /* ================= UI ================= */
  return (
    <div className="navbar">
      <h1>Task Assigner</h1>

      <span className="dashboard-label">
        Dashboard
        {currentOrg && (
          <>
            {" · "}
            <strong>{currentOrg.name}</strong>
          </>
        )}
      </span>

      {user && (
        <div className="navbar-user">

          {/* ================= ORGANIZATIONS ================= */}
          <div className="org-dropdown-wrapper">
            <button
              className="org-dropdown-btn"
              onClick={() => setShowOrgDropdown((p) => !p)}
            >
              🏢 Organizations ({organizations.length})
            </button>

            {showOrgDropdown && (
              <div className="org-dropdown-menu">
                <h4>My Organizations</h4>

                {organizations.map((org) => (
                  <div
                    key={org._id}
                    className={`org-item ${
                      currentOrg?._id === org._id ? "active" : ""
                    }`}
                    onClick={() => {
                      setCurrentOrg(org);
                      localStorage.setItem(
                        "currentOrganization",
                        JSON.stringify(org)
                      );
                      localStorage.setItem("currentOrganizationId", org._id);
                      setShowOrgDropdown(false);
                    }}
                  >
                    <strong>{org.name}</strong>
                  </div>
                ))}

                <Link to="/create-organization" className="org-link">
                  + Create Organization
                </Link>
              </div>
            )}
          </div>

          <Link to="/invite-users" className="nav-link">
            👥 Invite
          </Link>

          {/* ================= NOTIFICATIONS ================= */}
          <div className="notification-wrapper">
            <span
              className="bell"
              onClick={() => setShowDropdown((p) => !p)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </span>

            {showDropdown && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>

                <button
                  className="mark-all-btn"
                  onClick={markAllNotificationsRead}
                >
                  Mark all as read
                </button>

                {/* FILTERS */}
                <div className="notif-filters">
                  {["ALL", "ASSIGNED", "UPDATED", "INVITES", "UNREAD"].map(
                    (f) => (
                      <button
                        key={f}
                        className={`filter-btn ${
                          filter === f ? "active" : ""
                        }`}
                        onClick={() => setFilter(f)}
                      >
                        {f}
                      </button>
                    )
                  )}
                </div>

                {/* LIST */}
                {filteredNotifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${
                      n.isRead ? "read" : "unread"
                    }`}
                  >
                    {/* TASK */}
                    {(n.type === "TASK_ASSIGNED" ||
                      n.type === "TASK_UPDATED") && (
                      <div onClick={() => markNotificationRead(n._id)}>
                        <p>
                          <strong>{n.task?.title}</strong>
                        </p>
                        <p>{n.message}</p>
                      </div>
                    )}

                    {/* INVITE */}
                    {n.type === "ORG_INVITE" && (
                      <>
                        <p>{n.message}</p>
                        <button
                          className="invite-accept-btn"
                          onClick={() => handleInviteAccept(n)}
                        >
                          Accept
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span>👤 {user.name}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
