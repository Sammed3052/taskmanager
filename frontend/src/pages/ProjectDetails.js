import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Chart imports
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const projectRes = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(projectRes.data);

      const tasksRes = await axios.get(
        `http://localhost:5000/api/tasks/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedTasks = tasksRes.data;
      setTasks(fetchedTasks);
// ✅ Check if all tasks are completed and none are unassigned
const totalTasks = projectRes.data.totalTasks;
const completedTasks = fetchedTasks.filter(t => t.status === "submitted").length;
const notAssignedTasks = totalTasks - fetchedTasks.length;

// Only mark completed if all tasks are assigned AND completed
if (notAssignedTasks === 0 && completedTasks === totalTasks) {
  if (projectRes.data.status !== "Completed") {
    await axios.patch(
      `http://localhost:5000/api/projects/${projectId}`,
      { status: "Completed" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProject(prev => ({ ...prev, status: "Completed" }));
  }
}


      setLoading(false);
    } catch (err) {
      console.error("Error fetching project details:", err);
      setLoading(false);
    }
  };

  fetchData();
}, [projectId]);


  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!project) return <div className="text-center mt-5 text-danger">Project not found</div>;

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Progress":
        return <span className="badge bg-warning">{status}</span>;
      case "Completed":
        return <span className="badge bg-success">{status}</span>;
      case "Pending":
        return <span className="badge bg-secondary">{status}</span>;
      case "Submitted":
        return <span className="badge bg-primary">{status}</span>;
      default:
        return <span className="badge bg-info">{status}</span>;
    }
  };

  // Pie chart data
  const totalTasks = project.totalTasks;
  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
  const submittedCount = tasks.filter(t => t.status === "submitted").length;
  const notAssignedCount = totalTasks - tasks.length > 0 ? totalTasks - tasks.length : 0;

  const pieData = {
    labels: ["Pending", "In Progress", "Submitted", "Not Assigned"],
    datasets: [
      {
        data: [pendingCount, inProgressCount, submittedCount, notAssignedCount],
        backgroundColor: ["#6c757d", "#ffc107", "#0d6efd", "#dc3545"],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      datalabels: {
        color: "#fff",
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
          return `${percentage}%`;
        },
        font: { weight: "bold", size: 14 },
      },
    },
  };

  return (
    <div className="container mt-4">
      {/* Project Info Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title">{project.name}</h3>
          <p className="card-text">{project.description}</p>
          <p className="card-text">Total Tasks : {project.totalTasks}</p>
          <div className="d-flex justify-content-between flex-wrap">
            <div>Status: {getStatusBadge(project.status)}</div>
            <div>
              Deadline: <strong>{new Date(project.deadline).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <h4 className="mb-3">Tasks</h4>
      {tasks.length === 0 ? (
        <p className="text-muted">No tasks for this project yet.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded mb-4">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Developer</th>
                <th>Tester</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.developer?.name || "N/A"}</td>
                  <td>{task.tester?.name || "N/A"}</td>
                  <td>{getStatusBadge(task.status)}</td>
                  <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pie Chart */}
      <div className="my-4 d-flex justify-content-center">
        <div style={{ width: "40%" }}>
          <h5 className="text-center mb-3">Project Task Progress</h5>
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
