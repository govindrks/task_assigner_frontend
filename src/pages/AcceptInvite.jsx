import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { acceptInvite as acceptInviteApi } from "../api/invite.api";
import "./AcceptInvite.css";

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invite token missing. Please open the invite link from your email.");
      return;
    }

    let cancelled = false;
    let redirectTimeout = null;

    const runAcceptInvite = async () => {
      try {
        const authToken = localStorage.getItem("token");

        /* not logged in */
        if (!authToken) {
          const redirect = encodeURIComponent(`/accept-invite/${token}`);
          navigate(`/login?redirect=${redirect}`);
          return;
        }

        await acceptInviteApi(token);

        if (cancelled) return;

        setStatus("success");

        redirectTimeout = setTimeout(() => navigate("/dashboard"), 1500);

      } catch (err) {
        if (cancelled) return;

        setStatus("error");
        setMessage(
          err?.response?.data?.message || "Something went wrong"
        );
      }
    };

    runAcceptInvite();

    return () => {
      cancelled = true;
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [token, navigate]);

  return (
    <div className="invite-wrapper">
      <div className="invite-card">

        {status === "loading" && (
          <>
            <div className="spinner"></div>
            <h2>Joining organization...</h2>
            <p>Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="success">Success 🎉</h2>
            <p>You’ve joined the organization</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="error">Invite Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate("/dashboard")}>
              Go Home
            </button>
          </>
        )}

      </div>
    </div>
  );
}
