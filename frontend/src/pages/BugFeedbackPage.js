import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BugFeedbackPage = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/bugs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Decode JWT to get developer's ID
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const devId = decodedToken.id;

        // Filter bugs assigned to the logged-in developer
        const assignedBugs = res.data.filter(
          (bug) => bug.developerId?._id === devId
        );

        setBugs(assignedBugs);
      } catch (err) {
        console.error("❌ Error fetching bugs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, []);

  const handleModifyBug = async (bug) => {
    try {
      const token = localStorage.getItem("token");

      // Fetch submission for this task
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/tasks/${
          bug.taskId?._id || bug.taskId
        }/submission`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data.submitted) {
        alert("❌ No submission found for this task. Please submit code first.");
        return;
      }

      // Navigate to ModifyCode page
      navigate("/modify-code", {
        state: {
          bugId: bug._id,
          project: bug.projectId, // ✅ pass full project object
          task: bug.taskId, // ✅ pass full task object
          submissionId: res.data.id,
          code: res.data.code || "",
        },
      });
    } catch (err) {
      console.error("❌ Error fetching submission:", err);
      alert("❌ Could not fetch submission. Try again.");
    }
  };

  if (loading)
    return <div className="text-center py-4">Loading bugs...</div>;

  if (bugs.length === 0)
    return (
      <div className="text-center py-4 text-muted">
        No bugs assigned to you yet.
      </div>
    );

  return (
    <div className="container py-4">
      <h4 className="mb-4 fw-bold">🐞 Bugs Assigned to Me</h4>
      <div className="row g-3">
        {bugs.map((bug) => {
          // ✅ Normalize status to lowercase
         const normalizedStatus = bug.status?.toLowerCase() || "";
const disableButton =
  normalizedStatus === "inprogress" ||
  normalizedStatus === "in-progress" ||
  normalizedStatus === "completed";

          // Badge color based on severity
          const severityColor =
            bug.severity === "High"
              ? "bg-danger"
              : bug.severity === "Medium"
              ? "bg-warning text-dark"
              : "bg-secondary";

          return (
            <div key={bug._id} className="col-md-6">
              <div className="card border-start border-4 shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h6 className="card-title text-dark fw-bold">
                      📁 {bug.projectId?.name || "N/A"}
                    </h6>
                    <p className="card-text text-muted mb-1">
                      <strong>Task:</strong> {bug.taskId?.title || "N/A"}
                    </p>
                    <p className="card-text">
                      {bug.description || bug.bugTitle}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge ${severityColor}`}>
                        {bug.severity}
                      </span>
                      <small className="text-muted">
                        Reported By: {bug.reportedBy?.empId || "N/A"}
                      </small>
                    </div>
                    {bug.bugFile && (
                      <p className="mt-2">
                        <a
                          href={
                            bug.bugFile.startsWith("http")
                              ? bug.bugFile
                              : `${
                                  process.env.REACT_APP_API_URL ||
                                  "http://localhost:5000"
                                }/${bug.bugFile}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Attachment
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Modify Code Button */}
                  <div className="mt-3 text-end">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleModifyBug(bug)}
                      disabled={disableButton}
                    >
                      {normalizedStatus === "completed"
  ? "✅ Completed"
  : disableButton
  ? "⏳ In Progress"
  : "✏️ Modify Code"}

                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BugFeedbackPage;
