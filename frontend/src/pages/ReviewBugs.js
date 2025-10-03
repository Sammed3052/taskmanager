import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReviewBugs = () => {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT after PM login
        if (!token) {
          alert("Unauthorized! Please login again.");
          navigate("/PMLogin");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/suggestions/pm", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBugs(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching tester suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, [navigate]);

  // ✅ Update bug status
  const handleStatusChange = async (bugId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
     await axios.put(
  `http://localhost:5000/api/suggestions/${bugId}`,
  { status: newStatus },
  { headers: { Authorization: `Bearer ${token}` } }
);


      // Update UI without reload
      setBugs((prevBugs) =>
        prevBugs.map((bug) =>
          bug._id === bugId ? { ...bug, status: newStatus } : bug
        )
      );
    } catch (err) {
      console.error("❌ Error updating bug status:", err);
      alert("Failed to update status. Try again.");
    }
  };

  return (
    <div
      className="container py-4"
      style={{ fontFamily: "'Courier New', monospace", maxWidth: "1200px" }}
    >
      {/* Back to Dashboard */}
      <div className="mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/PMdashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white text-center fs-5 fw-bold">
          📝 Review Bug Suggestions
        </div>

        <div className="card-body bg-light p-4">
          {loading ? (
            <div className="text-center text-muted">⏳ Loading bugs...</div>
          ) : (
            <table className="table table-bordered table-hover text-center align-middle bg-white shadow-sm">
              <thead className="table-secondary">
                <tr>
                  <th>#</th>
                  <th>Suggestion  Title</th>
                  <th>Description</th>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {bugs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-muted">
                      No bug suggestions found for your projects.
                    </td>
                  </tr>
                ) : (
                  bugs.map((bug, index) => (
                    <tr key={bug._id}>
                      <td>{index + 1}</td>
                      <td>{bug.title}</td>
                      <td className="text-start">{bug.description}</td>
                      <td>{bug.taskId?.title || "N/A"}</td>
                      <td>{bug.projectId?.name || "N/A"}</td>
                      <td>{bug.testerId?.empId || "Unknown"}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={bug.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(bug._id, e.target.value)
                          }
                          disabled={bug.status === "Valid" || bug.status === "Invalid"} // ✅ Disable if already decided
                        >
                          <option value="Pending">Pending</option>
                          <option value="Valid">Valid Bug</option>
                          <option value="Invalid">Invalid Bug</option>
                        </select>
                      </td>
                      <td>
                        {bug.createdAt
                          ? new Date(bug.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewBugs;
