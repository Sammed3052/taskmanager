import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const navigate = useNavigate();

  const [project, setProject] = useState({
    name: '',
    description: '',
    status: '',
    deadline: '',
    totalTasks: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!project.name || !project.description || !project.deadline || !project.totalTasks) {
    alert('Please fill in all required fields.');
    return;
  }

  // ✅ Validate project deadline is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // remove time portion
  const projectDeadline = new Date(project.deadline);
  if (projectDeadline < today) {
    alert('Project deadline cannot be in the past.');
    return;
  }

  const token = localStorage.getItem('token'); // ✅ Get JWT token
  if (!token) {
    alert('User not authenticated');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...project,
        totalTasks: parseInt(project.totalTasks)
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Project created successfully!');
      navigate('/PMdashboard'); 
    } else {
      alert(data.error || '❌ Failed to create project');
    }
  } catch (error) {
    console.error('❌ Project creation error:', error);
    alert('Something went wrong. Please try again later.');
  }
};

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container mt-5 mb-4 flex-grow-1">
        <h2 className="mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Project Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={project.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              rows="3"
              value={project.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={project.status}
              onChange={handleChange}
            >
              <option value="Pending">Planning</option>
              
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="deadline" className="form-label">Deadline</label>
            <input
              type="date"
              className="form-control"
              name="deadline"
              value={project.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="totalTasks" className="form-label">Total Number of Tasks</label>
            <input
              type="number"
              className="form-control"
              name="totalTasks"
              min="1"
              value={project.totalTasks}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Create Project</button>
        </form>
      </div>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">© 2025 Project Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CreateProject;
