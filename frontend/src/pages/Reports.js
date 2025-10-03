import React, { useEffect, useState } from "react";
import axios from "axios";

const Reports = () => {
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [reports, setReports] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch submitted tasks (only tasks with submissions)
 useEffect(() => {
  const fetchSubmittedTasks = async () => {
    try {
      if (!token) return;

      // 1️⃣ Fetch all assigned tasks
      const res = await axios.get("http://localhost:5000/api/tasks/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allTasks = res.data || [];

      // 2️⃣ Fetch all bugs once
      const bugsRes = await axios.get("http://localhost:5000/api/bugs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allBugs = bugsRes.data || [];

      const submittedTasksList = [];
      const reportsList = [];

      for (const task of allTasks) {
        try {
          // 3️⃣ Check submission status
          const subRes = await axios.get(
            `http://localhost:5000/api/tasks/${task._id}/submission`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // 4️⃣ Filter bugs related to this task
          const taskBugs = allBugs.filter(b => b.taskId._id === task._id);

          // 5️⃣ Only include task if all bugs are completed (or no bugs exist)
          const allBugsCompleted = taskBugs.every(b => b.status === "Completed");
          if (!allBugsCompleted) continue; // skip task

          // 6️⃣ Prepare dropdown & table
          if (subRes.data.submitted) {
            if (subRes.data.status === "submitted") {
              // Already submitted → push to table
              reportsList.push({
                task: task.title,
                status: "✅ Submitted",
                developer: task.developer?.empId || "Unknown",
                lastUpdated: new Date(task.updatedAt || Date.now()).toLocaleDateString(),
              });
            } else {
              // Pending submission → keep in dropdown
              submittedTasksList.push({ ...task });
            }
          }
        } catch (err) {
          console.error(`Error fetching submission for task "${task.title}":`, err);
        }
      }

      // 7️⃣ Update state
      setSubmittedTasks(submittedTasksList);
      setReports(reportsList);
    } catch (err) {
      console.error("❌ Error fetching tasks or bugs:", err);
    }
  };

  fetchSubmittedTasks();
}, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskId) return alert("Please select a task!");

    const task = submittedTasks.find((t) => t._id === selectedTaskId);
    if (!task) return;

    // ✅ Confirmation before submitting
    const confirmSubmit = window.confirm(
      `Are you sure you want to submit the report for task "${task.title}"?`
    );
    if (!confirmSubmit) return;

    try {
      // ✅ Update submission status in the database
     await axios.post(
  `http://localhost:5000/api/tasks/${task._id}/approve`,
  { report: "Approved and submitted" },  // optional tester note
  { headers: { Authorization: `Bearer ${token}` } }
);


      // ✅ Prepare developer info safely
      let developerInfo = "Unknown";
      if (task.developer) {
        if (typeof task.developer === "object") {
          developerInfo = task.developer.empId || task.developer._id || "Unknown";
        } else {
          developerInfo = task.developer;
        }
      }

      // ✅ Add to local reports table
      const newReport = {
        task: task.title,
        status: "✅ Submitted",
        developer: developerInfo,
        lastUpdated: new Date().toLocaleDateString(),
      };

      setReports([...reports, newReport]);
      setSelectedTaskId("");
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("❌ Failed to submit report. Try again.");
    }
  };

  return (
    <div
      className="container py-4"
      style={{ fontFamily: "'Courier New', monospace", maxWidth: "1100px" }}
    >
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white text-center fs-5 fw-bold">
          📊 QA Reports
        </div>

        <div className="card-body bg-light p-4">
          {/* Form to add report */}
          <form className="mb-4" onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Select Submitted Task</label>
                <select
                  className="form-select"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                >
                  <option value="">-- Choose a task --</option>
                  {submittedTasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Submit Report
            </button>
          </form>

          {/* Submitted reports table */}
          <table className="table table-bordered table-hover text-center align-middle bg-white shadow-sm">
            <thead className="table-secondary">
              <tr>
                <th>#</th>
                <th>Task</th>
                <th>Status</th>
                <th>Developer</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{report.task}</td>
                    <td>{report.status}</td>
                    <td>{report.developer}</td>
                    <td>{report.lastUpdated}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-muted text-center">
                    No reports submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
