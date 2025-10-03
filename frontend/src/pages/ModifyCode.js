import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCode, FaInfoCircle, FaTasks, FaProjectDiagram } from "react-icons/fa";
import axios from "axios";

const ModifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get details passed from BugFeedbackPage
  const { project, task, bugId, submissionId, code: initialCode } =
    location.state || {};

  const [code, setCode] = useState(initialCode || "");
  const [uploading, setUploading] = useState(false);
  const [bugStatus, setBugStatus] = useState("");

  // ✅ Fetch bug status
  const fetchBugStatus = useCallback(async () => {
    if (!bugId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/bugs/${bugId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBugStatus(res.data.status || "");
    } catch (err) {
      console.error("❌ Error fetching bug status:", err);
    }
  }, [bugId]);

  useEffect(() => {
    if (!task || !project || !bugId) {
      alert("❌ Missing details. Please go back and try again.");
      navigate("/developer-dashboard");
    } else {
      fetchBugStatus();
    }
  }, [task, project, bugId, navigate, fetchBugStatus]);

  // ✅ Handle code modification
  const handleModify = async () => {
    if (!bugId) return;
    if (code.trim() === "") {
      alert("❌ Please write or paste your code before saving.");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      // 🔥 PATCH bug route automatically sets status = InProgress
      const res = await axios.patch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/bugs/${bugId}/status`,
        { status: "InProgress", submissionId, code }, // ✅ send code + submission reference
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "✅ Bug marked InProgress!");
      setBugStatus("InProgress");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Modification failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-center mb-4">✏️ Modify Submitted Code</h2>

      <div className="alert alert-info d-flex align-items-center shadow-sm">
        <FaInfoCircle className="me-2" />
        <span>
          After fixing the bug, save your changes. Bug status will move to{" "}
          <strong>In-Progress</strong>. If tester rejects, it will reset to{" "}
          <strong>Pending</strong>.
        </span>
      </div>

      <div
        className="card shadow-lg border-0 p-4"
        style={{ borderRadius: "15px", backgroundColor: "#fefefe" }}
      >
        {project && (
          <>
            <h5 className="mb-3 d-flex align-items-center text-dark">
              <FaProjectDiagram className="me-2 text-primary" /> Project Info
            </h5>
            <input
              type="text"
              className="form-control mb-3"
              value={project?.name || "N/A"}
              disabled
            />
          </>
        )}

        {task && (
          <>
            <h5 className="mb-3 d-flex align-items-center text-dark">
              <FaTasks className="me-2 text-success" /> Task Info
            </h5>
            <input
              type="text"
              className="form-control mb-2"
              value={task?.title || "N/A"}
              disabled
            />
          </>
        )}

        <h5 className="mb-3 d-flex align-items-center text-dark">
          <FaCode className="me-2 text-warning" /> Modify Code
        </h5>
        <textarea
          className="form-control mb-3"
          rows="12"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="💻 Write or paste your code here..."
          style={{
            fontFamily: "monospace",
            backgroundColor: "#f8f9fa",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          }}
        ></textarea>

        <button
          className="btn btn-warning fw-bold w-100"
          onClick={handleModify}
          disabled={
            code.trim() === "" || uploading || bugStatus === "InProgress"
          }
          style={{ borderRadius: "10px", fontSize: "16px" }}
        >
          {bugStatus === "InProgress"
            ? "⏳ In Progress"
            : uploading
            ? "⏳ Saving..."
            : "✏️ Save Modified Code"}
        </button>
      </div>
    </div>
  );
};

export default ModifyCode;
