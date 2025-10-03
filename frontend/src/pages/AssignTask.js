import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AssignTask = () => {
  const navigate = useNavigate();

  const [task, setTask] = useState({
    title: '',
    description: '',
    developer: '',
    tester: '',
    dueDate: '',
    project: '',
    document: null
  });

  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [testers, setTesters] = useState([]);
  const [tasksForProjects, setTasksForProjects] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('Unauthorized. Please login.');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch projects, developers, testers
        const [projectsRes, devsRes, testersRes] = await Promise.all([
          fetch('http://localhost:5000/api/projects', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/employees/developers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/employees/testers', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!projectsRes.ok) throw new Error('Failed to fetch projects');
        if (!devsRes.ok) throw new Error('Failed to fetch developers');
        if (!testersRes.ok) throw new Error('Failed to fetch testers');

        const projData = await projectsRes.json();
        const devData = await devsRes.json();
        const testerData = await testersRes.json();

        setProjects(projData);
        setDevelopers(devData);
        setTesters(testerData);

        // Fetch tasks count for each project
        const tasksData = {};
        await Promise.all(
          projData.map(async (proj) => {
            const res = await fetch(`http://localhost:5000/api/tasks/project/${proj._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const tasks = await res.json();
              tasksData[proj._id] = tasks.length;
            } else {
              tasksData[proj._id] = 0;
            }
          })
        );

        setTasksForProjects(tasksData);

      } catch (err) {
        console.error('❌ Error fetching data:', err);
        alert(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setTask((prev) => ({ ...prev, document: file }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const selectedProject = projects.find(p => p._id === task.project);
  if (!selectedProject) {
    alert('Please select a valid project');
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDueDate = new Date(task.dueDate);
  const projectDeadline = new Date(selectedProject.deadline);

  if (taskDueDate < today) {
    alert('Task due date cannot be in the past');
    return;
  }

  if (taskDueDate > projectDeadline) {
    alert(`Task due date cannot exceed project deadline (${projectDeadline.toLocaleDateString()})`);
    return;
  }

  const formData = new FormData();
  formData.append('title', task.title);
  formData.append('description', task.description);
  formData.append('developer', task.developer);
  formData.append('tester', task.tester);
  formData.append('project', task.project);
  formData.append('dueDate', task.dueDate);
  if (task.document) {
    formData.append('document', task.document);
  }

  try {
    // 1️⃣ Assign the task
    const res = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Task creation failed');
    }

    // 2️⃣ Update project status if needed
    if (selectedProject.status === 'Pending') {
      await fetch(`http://localhost:5000/api/projects/${selectedProject._id}`, {
        method: 'PATCH', // Assuming your API supports PATCH to update status
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'In Progress' }),
      });
    }

    alert('✅ Task assigned successfully');
    navigate('/PMdashboard');

  } catch (err) {
    console.error('❌ Error submitting task:', err);
    alert(err.message || 'Network error while assigning task');
  }
};


  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }

  // Filter projects for dropdown
  const availableProjects = projects.filter(proj => {
    const projDeadline = new Date(proj.deadline);
    const assignedTasksCount = tasksForProjects[proj._id] || 0;
    return projDeadline >= new Date() && assignedTasksCount < proj.totalTasks;
  });

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Assign Task</h2>
      <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">

        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Task Title</label>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Task Description</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
            required
          />
        </div>

        {/* Developer */}
        <div className="mb-3">
          <label className="form-label">Assign To (Developer)</label>
          <select
            name="developer"
            value={task.developer}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Developer</option>
            {developers.map(dev => (
              <option key={dev._id} value={dev._id}>{dev.empId}</option>
            ))}
          </select>
        </div>

        {/* Tester */}
        <div className="mb-3">
          <label className="form-label">Assign To (Tester)</label>
          <select
            name="tester"
            value={task.tester}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Tester</option>
            {testers.map(t => (
              <option key={t._id} value={t._id}>{t.empId}</option>
            ))}
          </select>
        </div>

        {/* Project */}
        <div className="mb-3">
          <label className="form-label">Related Project</label>
          <select
            name="project"
            value={task.project}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Project</option>
            {availableProjects.length > 0 ? (
              availableProjects.map(proj => (
                <option key={proj._id} value={proj._id}>
                  {proj.name} (Remaining Tasks: {proj.totalTasks - (tasksForProjects[proj._id] || 0)})
                </option>
              ))
            ) : (
              <option disabled>No available projects</option>
            )}
          </select>
        </div>

        {/* Due Date */}
        <div className="mb-3">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={task.dueDate}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* File Upload */}
        <div className="mb-3">
          <label className="form-label">Upload Supporting Document (Optional)</label>
          <input
            type="file"
            name="document"
            className="form-control"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
        </div>

        <button type="submit" className="btn btn-primary">Assign Task</button>
      </form>
    </div>
  );
};

export default AssignTask;
