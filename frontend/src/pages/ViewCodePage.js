import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ViewCodePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const task = location.state?.task;
  const [fullTask, setFullTask] = useState(task || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!task?._id) {
      setLoading(false);
      return;
    }

    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem("token"); // if your API requires auth
        const res = await fetch(
          `http://localhost:5000/api/tasks/${task._id}/submission`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!res.ok) throw new Error("Failed to fetch submission");

        const data = await res.json();

        // merge submission into task details
        setFullTask((prev) => ({
          ...prev,
          code: data.code || "",
          submitted: data.submitted || false,
          status: data.status || prev.status,
          feedback: data.feedback || null,
        }));
      } catch (err) {
        console.error("❌ Error fetching submission:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [task]);

  if (!task) return <div className="p-4">❌ No task data provided.</div>;

  return (
    <div
      className="container py-4"
      style={{ fontFamily: "'Courier New', monospace", maxWidth: "900px" }}
    >
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white fs-5 fw-bold d-flex justify-content-between align-items-center">
          🧾 View Submitted Code
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/tester-dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="card-body bg-light">
          {/* Project & Task Info */}
          <div className="mb-4">
            <h5 className="text-secondary mb-1">
              📌 Project:{" "}
              <span className="text-dark">
                {fullTask.projectName || "Unknown Project"}
              </span>
            </h5>
            <h6 className="mb-0">
              👨‍💻 Developer:{" "}
              {typeof fullTask.developer === "object"
                ? fullTask.developer?.empId || "N/A"
                : fullTask.developer || "N/A"}
            </h6>
            <p className="mt-2">
              <strong>📝 Task Description:</strong>{" "}
              {fullTask.description || "No description provided."}
            </p>
            <p className="mt-1">
              <strong>📌 Status:</strong>{" "}
              <span className="badge bg-info text-dark">{fullTask.status}</span>
            </p>
            {fullTask.feedback && (
              <p className="text-danger mt-1">
                <strong>📝 Tester Feedback:</strong> {fullTask.feedback}
              </p>
            )}
          </div>

          {/* Code Block */}
          <div
            className="bg-dark text-light p-3 rounded"
            style={{ fontSize: "0.95rem", lineHeight: "1.4" }}
          >
            {loading ? (
              <p>⏳ Loading submitted code...</p>
            ) : fullTask.submitted ? (
              <pre className="mb-0">{fullTask.code}</pre>
            ) : (
              <pre className="mb-0">No code submitted.</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCodePage;
