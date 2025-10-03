import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BugReportPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [bugTitle, setBugTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [module, setModule] = useState("");
  const [bugFile, setBugFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSubmittedTasks = async () => {
      try {
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch("http://localhost:5000/api/tasks/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const allTasks = await res.json();

        // ✅ Filter tasks that are already submitted
        const submittedTasks = allTasks.filter(
          (task) => task.status?.toLowerCase() === "in-progress"
        );

        setTasks(submittedTasks);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSubmittedTasks();
  }, [navigate, token]);

  // Auto-fill project when task is selected
  const handleTaskChange = (e) => {
    const taskId = e.target.value;
    setSelectedTaskId(taskId);

    const task = tasks.find((t) => t._id === taskId);
    setProjectName(task ? task.projectName || "" : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTaskId) {
      alert("⚠️ Please select a Task");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("taskId", selectedTaskId);
      formData.append("projectName", projectName);
      formData.append("bugTitle", bugTitle);
      formData.append("module", module);
      formData.append("severity", severity);
      formData.append("description", description);
      if (bugFile) formData.append("bugFile", bugFile);

      const res = await fetch("http://localhost:5000/api/bugs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit bug report");

      alert("🐞 Bug report submitted successfully!");
      navigate("/tester-dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting bug report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-4"
      style={{ fontFamily: "'Courier New', monospace", maxWidth: "800px" }}
    >
      <div className="card shadow-lg border-danger border-2">
        <div className="card-header bg-danger text-white text-center fs-4 fw-bold">
          🐞 Bug/Error Logging Panel
        </div>

        <div className="card-body bg-light-subtle px-4 py-3">
          <form onSubmit={handleSubmit}>
            {/* Task Name Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">
                📌 Task Name (Submitted Code Only)
              </label>
              <select
                className="form-select border-danger"
                value={selectedTaskId}
                onChange={handleTaskChange}
                required
              >
                <option value="">-- Select Task --</option>
                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Name */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">🔧 Project Name</label>
              <input
                type="text"
                className="form-control border-danger"
                required
                value={projectName}
                readOnly
              />
            </div>

            {/* Bug Title */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">📌 Bug Title</label>
              <input
                type="text"
                className="form-control border-danger"
                required
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                placeholder="e.g. Crash when clicking Login"
              />
            </div>

            {/* Module */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">📂 Module (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="e.g. Authentication, Dashboard"
              />
            </div>

            {/* Severity */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">⚠️ Severity</label>
              <select
                className="form-select border border-warning"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
                <option value="Critical">🔥 Critical</option>
              </select>
            </div>

            {/* Bug Description */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">📝 Bug Description</label>
              <textarea
                className="form-control border-dark bg-white"
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, steps to reproduce, expected vs actual behavior..."
              ></textarea>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="form-label fw-bold text-dark">
                📎 Attach Screenshot/Logs (Optional)
              </label>
              <input
                type="file"
                className="form-control border-secondary"
                onChange={(e) => setBugFile(e.target.files[0])}
              />
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn btn-danger shadow-sm"
                disabled={loading}
              >
                {loading ? "Submitting..." : "📤 Submit Bug"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/tester-dashboard")}
              >
                ← Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BugReportPage;
