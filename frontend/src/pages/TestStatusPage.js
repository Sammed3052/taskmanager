import React, { useEffect, useState } from "react";
import axios from "axios";

const TestStatusPage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch tester's bug reports
        const bugRes = await axios.get("http://localhost:5000/api/bugs/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch tasks assigned for testing
        const taskRes = await axios.get("http://localhost:5000/api/tasks/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // --- Normalize Bug Data ---
        const bugData = bugRes.data.map((bug) => ({
          _id: bug._id,
          type: "Bug",
          title: bug.bugTitle,
          description: bug.description,
          task: bug.taskId?.title || "N/A",
          project: bug.projectId?.name || "N/A",
          developer: bug.developerId?.empId || "Unassigned",
          status: bug.status, // Resolved / Rejected / Pending
          createdAt: bug.createdAt,
        }));

        // --- Normalize Task Data ---
        const taskData = taskRes.data.map((task) => ({
          _id: task._id,
          type: "Task",
          title: task.title,
          description: task.description || "—",
          task: task.title,
          project: task.projectName || "N/A", // from .populate in backend
          developer:
            typeof task.developer === "object"
              ? task.developer.empId
              : "Unassigned",
          status: task.status, // pending / in-progress / submitted
          createdAt: task.createdAt,
        }));

        setRecords([...bugData, ...taskData]);
      } catch (err) {
        console.error("❌ Error fetching records:", err);
      }
    };

    fetchData();
  }, []);

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-success";
    case "inprogress":
    case "in-progress": // just in case backend sends this style
      return "bg-warning text-dark";
    case "pending":
      return "bg-secondary";
    case "submitted":
      return "bg-info text-dark"; // for tasks only
    default:
      return "bg-light text-dark";
  }
};


  return (
    <div
      className="container py-4"
      style={{ fontFamily: "'Courier New', monospace", maxWidth: "1100px" }}
    >
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white text-center fs-5 fw-bold">
          🐞 My Testing Dashboard (Bugs + Tasks)
        </div>

        <div className="card-body bg-light p-4">
          <table className="table table-bordered table-hover text-center align-middle bg-white shadow-sm">
            <thead className="table-secondary">
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Title</th>
                <th>Description</th>
                <th>Task</th>
                <th>Project</th>
                <th>Developer</th>
                <th>Status</th>
                <th>Created On</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((rec, index) => (
                  <tr key={rec._id}>
                    <td>{index + 1}</td>
                    <td>
                      <span
                        className={`badge ${
                          rec.type === "Bug" ? "bg-danger" : "bg-primary"
                        }`}
                      >
                        {rec.type}
                      </span>
                    </td>
                    <td>{rec.title}</td>
                    <td className="text-start">{rec.description}</td>
                    <td>{rec.task}</td>
                    <td>{rec.project}</td>
                    <td>{rec.developer}</td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-1 ${getStatusBadge(
                          rec.status
                        )}`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-muted text-center">
                    No bugs or tasks found yet.
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

export default TestStatusPage;
