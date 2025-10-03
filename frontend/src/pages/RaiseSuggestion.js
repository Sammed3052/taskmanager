import React, { useState, useEffect } from "react";

const RaiseSuggestion = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [pmId, setPmId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch assigned tasks that are not submitted
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/tasks/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const assignedTasks = await res.json();

        // Filter tasks that are not submitted
        const pendingTasks = assignedTasks.filter(
          (task) => task.status !== "submitted" && task.submissionStatus !== "submitted"
        );

        setTasks(pendingTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, [token]);

  // Handle task selection
  const handleTaskChange = (e) => {
    const id = e.target.value;
    setSelectedTaskId(id);

    const task = tasks.find((t) => t._id === id);
    if (task) {
      setProjectName(task.project?.name || "");
      setProjectId(task.project?._id || "");
      setTaskTitle(task.title || "");
      setPmId(task.createdBy?._id || "");
    } else {
      setProjectName("");
      setProjectId("");
      setTaskTitle("");
      setPmId("");
    }
  };

  // Submit suggestion
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTaskId || !projectId || !title || !description) {
      alert("⚠️ Please fill all fields");
      return;
    }
    if (!token) {
      alert("⚠️ Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        taskId: selectedTaskId,
        projectId,
        pmId,
        title,
        description,
      };

      const res = await fetch("http://localhost:5000/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save suggestion");

      alert("✅ Suggestion sent successfully");

      // Reset form
      setSelectedTaskId("");
      setProjectName("");
      setProjectId("");
      setTaskTitle("");
      setPmId("");
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error sending suggestion:", err);
      alert("❌ Failed to send suggestion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ fontFamily: "'Courier New', monospace", maxWidth: "800px" }}>
      <div className="card shadow border-0">
        <div className="card-header bg-primary text-white text-center fs-5 fw-bold">
          💡 Raise Suggestion to PM (Dev)
        </div>

        <div className="card-body bg-light p-4">
          <p className="text-muted small">
            If you think a task can be improved or has issues, raise a suggestion for the PM to review.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Task dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">📌 Task</label>
              <select className="form-select" value={selectedTaskId} onChange={handleTaskChange} required>
                <option value="">-- Select Task --</option>
                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Project auto-filled */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">🏷️ Project</label>
              <input type="text" className="form-control" value={projectName} readOnly />
            </div>

            {/* Suggestion Title */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">💡 Suggestion Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Improve error message for invalid login"
                required
              />
            </div>

            {/* Suggestion Description */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">📝 Suggestion Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain your suggestion in detail."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Suggestion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RaiseSuggestion;
