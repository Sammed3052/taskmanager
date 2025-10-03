import React, { useState, useEffect } from "react";

const TaskSuggestion = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [pmId, setPmId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // 👈 JWT token

  // Fetch submitted tasks
  useEffect(() => {
    const fetchSubmittedTasks = async () => {
      try {
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/tasks/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const allTasks = await res.json();

        const submittedTasks = [];
        for (const task of allTasks) {
          try {
            const subRes = await fetch(
              `http://localhost:5000/api/tasks/${task._id}/submission`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!subRes.ok) continue;

            const subData = await subRes.json();
            // ✅ Only include tasks that reached "submitted" stage
            if (subData.status === "in-progress") submittedTasks.push(task);
          } catch (err) {
            console.error("Error fetching submission:", err);
          }
        }

        setTasks(submittedTasks);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSubmittedTasks();
  }, [token]);

  // Handle task change
  const handleTaskChange = (e) => {
    const id = e.target.value;
    setSelectedTaskId(id);

    const task = tasks.find((t) => t._id === id);
    if (task) {
      setProjectName(task.project?.name || "");
      setProjectId(task.project?._id || "");
      setPmId(task.project?.pm || task.createdBy?._id || "");
    } else {
      setProjectName("");
      setProjectId("");
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

      if (!res.ok) throw new Error("Failed to send suggestion");

      alert("✅ Suggestion sent to PM");
      // Reset form
      setSelectedTaskId("");
      setProjectName("");
      setProjectId("");
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
    <div
      className="container py-4"
      style={{ fontFamily: "'Courier New', monospace", maxWidth: "800px" }}
    >
      <div className="card shadow border-0">
        <div className="card-header bg-primary text-white text-center fs-5 fw-bold">
          📝 Task Suggestion to PM
        </div>

        <div className="card-body bg-light p-4">
          <p className="text-muted small">
            If you find something that looks like a bug but may be acceptable,
            use this form to ask the PM before reporting it.
          </p>
          <form onSubmit={handleSubmit}>
            {/* Task dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">
                📌 Task (Final Submitted Only)
              </label>
              <select
                className="form-select"
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

            {/* Project (auto-filled) */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">🏷️ Project</label>
              <input
                type="text"
                className="form-control"
                value={projectName}
                readOnly
              />
            </div>

            {/* Suggestion Title */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">
                🧩 Suggestion Title
              </label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Mobile number login enabled but not in requirement"
                required
              />
            </div>

            {/* Suggestion Description */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">📝 Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why this may be acceptable or should be treated as a bug."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send to PM"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskSuggestion;
