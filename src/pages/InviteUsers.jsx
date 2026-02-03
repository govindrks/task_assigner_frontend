import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getMyOrganizations } from "../api/organization.api";
import { inviteUser } from "../api/invite.api";

export default function InviteUsers() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentOrg = JSON.parse(localStorage.getItem("currentOrganization"));

  /* ================= FETCH ORGANIZATIONS ================= */
  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    // Re-fetch when page becomes visible (tab switch)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrganizations();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await getMyOrganizations();
      // Ensure orgs is always an array
      let orgs = [];
      if (Array.isArray(res)) {
        orgs = res;
      } else if (Array.isArray(res.data)) {
        orgs = res.data;
      } else if (res && typeof res === 'object') {
        orgs = [];
      }
      
      setOrganizations(orgs || []);

      // Auto-select current org
      if (currentOrg && orgs.length > 0) {
        setSelectedOrgId(currentOrg._id);
      } else if (orgs.length > 0) {
        setSelectedOrgId(orgs[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setOrganizations([]);
      setError("Failed to load organizations");
    }
  };

  /* ================= CHECK ADMIN PERMISSION ================= */
  const isAdminOfSelectedOrg = () => {
    const org = organizations.find((o) => o._id === selectedOrgId);
    if (!org) return false;

    const isCreator = org.createdBy?._id === currentUser?.id || org.createdBy === currentUser?.id;
    const isMemberAdmin = org.members?.some(
      (m) => (m.user?._id === currentUser?.id || m.user === currentUser?.id) && m.role === "ADMIN"
    );

    return isCreator || isMemberAdmin;
  };

  /* ================= SEND INVITE ================= */
  const handleInvite = async () => {
    setError("");
    setSuccess("");

    if (!selectedOrgId) {
      setError("Please select an organization");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    if (!isAdminOfSelectedOrg()) {
      setError("You do not have permission to invite users to this organization");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        organizationId: selectedOrgId,
      };
      
      console.log("[InviteUsers] Sending payload:", payload);
      const response = await inviteUser(payload);
      console.log("[InviteUsers] Response:", response);
      
      setSuccess(`Invite sent to ${email}`);
      setEmail("");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("[InviteUsers] Error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send invite";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleInvite();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />

        <div className="auth-card" style={{ maxWidth: "500px", margin: "40px auto" }}>
          <h2>Invite User to Organization</h2>

          {/* ORGANIZATION SELECT */}
          {organizations.length === 0 ? (
            <p style={{ color: "#666" }}>
              No organizations. Please create one first.
            </p>
          ) : (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label>
                  <strong>Organization:</strong>
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  disabled={loading}
                  style={{ width: "100%", padding: "8px", marginTop: "6px" }}
                >
                  <option value="">Select organization</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                      {!isAdminOfSelectedOrg() && org._id === selectedOrgId
                        ? " (No permission)"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrgId && !isAdminOfSelectedOrg() && (
                <p style={{ color: "orange", fontSize: "12px" }}>
                  ⚠️ You are not an admin of this organization and cannot send invites.
                </p>
              )}

              {selectedOrgId && isAdminOfSelectedOrg() && (
                <>
                  <input
                    type="email"
                    placeholder="Enter email to invite"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    style={{ width: "100%", marginBottom: "12px" }}
                  />
                  <button
                    onClick={handleInvite}
                    disabled={loading || !selectedOrgId}
                    style={{ width: "100%" }}
                  >
                    {loading ? "Sending..." : "Send Invite"}
                  </button>
                </>
              )}
            </>
          )}

          {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
          {success && <p style={{ color: "green", marginTop: "12px" }}>{success}</p>}
        </div>
      </div>
    </div>
  );
}
