import { useState } from "react";
import { createOrganization } from "../api/organization.api";
import { useNavigate } from "react-router-dom";

export default function CreateOrganization() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    if (name.trim().length < 3) {
      setError("Organization name must be at least 3 characters");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
      };

      // Only add description if provided
      if (description.trim()) {
        payload.description = description.trim();
      }

      console.log("[CreateOrganization] Submitting payload:", payload);
      
      const response = await createOrganization(payload);
      
      console.log("[CreateOrganization] Full response:", response);
      
      // Handle different response structures
      const orgData = response.data?.data || response.data || response;
      
      if (orgData && orgData._id) {
        console.log("[CreateOrganization] Organization created successfully:", orgData);
        
        // Store the current organization in localStorage
        localStorage.setItem("currentOrganizationId", orgData._id);
        localStorage.setItem("currentOrganization", JSON.stringify(orgData));
        
        // Navigate to invite page after successful creation
        setTimeout(() => {
          navigate("/invite-users", { replace: true });
        }, 500);
      } else {
        setError("Invalid response from server");
        console.error("[CreateOrganization] Invalid response structure:", response);
      }
    } catch (err) {
      console.error("[CreateOrganization] Error:", err);
      const errorMessage = 
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create organization";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h2>Create Organization</h2>
      
      <input
        type="text"
        placeholder="Organization name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "4px",
          border: "1px solid #dfe1e6",
          fontSize: "14px",
          boxSizing: "border-box",
        }}
      />
      
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "16px",
          borderRadius: "4px",
          border: "1px solid #dfe1e6",
          fontSize: "14px",
          minHeight: "100px",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
      
      {error && (
        <div style={{
          color: "#ae2a19",
          backgroundColor: "#ffcccc",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "16px",
          fontSize: "14px",
        }}>
          {error}
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: loading ? "#ccc" : "#09e24a",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
        }}
      >
        {loading ? "Creating..." : "Create Organization"}
      </button>
    </div>
  );
}
