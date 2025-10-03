import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PMProfile = () => {
  const [pmData, setPmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/"); // redirect to login if no token
          return;
        }

        const response = await axios.get("http://localhost:5000/api/pm/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPmData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch PM profile error:", err.response?.data || err.message);
        navigate("/"); // redirect if token invalid or error
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="text-center mt-5">Loading profile...</div>;

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Project Manager Profile</h3>
      <div className="card shadow-sm p-4" style={{ maxWidth: "600px", margin: "auto" }}>
        <div className="d-flex align-items-center mb-3">
          <img
            src={pmData.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="rounded-circle me-3"
            width="80"
            height="80"
            style={{ objectFit: "cover", border: "1px solid #dee2e6" }}
          />
          <div>
            <h5 className="fw-bold">{pmData.name}</h5>
            <p className="text-muted">Project Manager</p>
          </div>
        </div>
        <div className="mb-2"><strong>PM ID:</strong> {pmData.pmId}</div>
        <div className="mb-2"><strong>Email:</strong> {pmData.email}</div>
        <div className="mb-2"><strong>Mobile:</strong> {pmData.mobile}</div>
        <div className="mb-2"><strong>Address:</strong> {pmData.address || "N/A"}</div>
        <div className="mb-2"><strong>Account Created:</strong> {new Date(pmData.createdAt).toLocaleString()}</div>
        <div className="mb-2"><strong>Last Updated:</strong> {new Date(pmData.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default PMProfile;
