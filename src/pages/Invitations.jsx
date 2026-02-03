import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getInvites, acceptInvite, rejectInvite } from "../api/invite.api";
import "./Invitations.css";

export default function Invitations() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getInvites();
      const invitesList = Array.isArray(res) ? res : res.data || [];
      setInvites(invitesList);
    } catch (err) {
      console.error("Failed to fetch invites:", err);
      setError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId) => {
    setProcessingId(inviteId);
    try {
      await acceptInvite(inviteId);
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
      // Optionally reload organizations or show success
      window.location.reload();
    } catch (err) {
      console.error("Failed to accept invite:", err);
      setError("Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (inviteId) => {
    setProcessingId(inviteId);
    try {
      await rejectInvite(inviteId);
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
    } catch (err) {
      console.error("Failed to reject invite:", err);
      setError("Failed to reject invitation");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />

        <div className="invitations-container">
          <h2>Organization Invitations</h2>

          {error && <div className="error-banner">{error}</div>}

          {loading && <p className="loading">Loading invitations...</p>}

          {!loading && invites.length === 0 && (
            <p className="empty-state">
              You have no pending invitations.
            </p>
          )}

          {!loading && invites.length > 0 && (
            <div className="invites-list">
              {invites.map((invite) => (
                <div key={invite._id} className="invite-card">
                  <div className="invite-content">
                    <h3>{invite.organization?.name || "Unknown Organization"}</h3>
                    <p className="invite-meta">
                      Invited by: <strong>{invite.invitedBy?.name || "Unknown"}</strong>
                    </p>
                    {invite.organization?.description && (
                      <p className="invite-desc">
                        {invite.organization.description}
                      </p>
                    )}
                    <small className="invite-date">
                      Invited on {new Date(invite.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="invite-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(invite._id)}
                      disabled={processingId === invite._id}
                    >
                      {processingId === invite._id ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(invite._id)}
                      disabled={processingId === invite._id}
                    >
                      {processingId === invite._id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
