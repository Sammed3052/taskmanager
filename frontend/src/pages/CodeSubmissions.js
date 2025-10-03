import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCode, FaInfoCircle, FaTasks } from 'react-icons/fa';
import axios from 'axios';

const CodeSubmissions = () => {
  const [code, setCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    description: '',
    status: '',
    projectName: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Get taskId from dashboard URL query
  const queryParams = new URLSearchParams(location.search);
  const taskIdFromDashboard = queryParams.get('taskId');

  // Fetch the task details automatically
  useEffect(() => {
    const fetchTask = async () => {
      if (!taskIdFromDashboard) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/tasks/${taskIdFromDashboard}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { title, description, status, projectName } = res.data;
        setTaskDetails({ title, description, status, projectName });
      } catch (err) {
        console.error('❌ Error fetching task:', err);
        alert('❌ Failed to load task. Please try again.');
      }
    };
    fetchTask();
  }, [taskIdFromDashboard]);

  // Handle code submission
  const handleSubmit = async () => {
    if (!taskIdFromDashboard) {
      alert('❌ Task not loaded yet.');
      return;
    }

    if (code.trim() === '') {
      alert('❌ Please write or paste your code before submitting.');
      return;
    }

    try {
      setUploading(true);
      const res = await axios.post(
        `http://localhost:5000/api/tasks/${taskIdFromDashboard}/submit`,
        { code },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      alert(res.data.message || '✅ Submission successful!');
      navigate('/developer-dashboard'); // Redirect after success
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || '❌ Submission failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-center mb-4">📤 Code Submission</h2>

      {/* Instruction */}
      <div className="alert alert-info d-flex align-items-center">
        <FaInfoCircle className="me-2" />
        <span>
          Submit your <strong>code</strong> for the selected task below.
        </span>
      </div>

      <div className="card shadow-lg p-4 border-0" style={{ borderRadius: '12px' }}>
        {/* Task info (auto-filled input fields) */}
        <h5 className="mb-3 d-flex align-items-center">
          <FaTasks className="me-2 text-success" /> Task Details
        </h5>
        <div className="mb-3">
          <label className="form-label"><strong>Title:</strong></label>
          <input
            type="text"
            className="form-control mb-2"
            name="title"
            value={taskDetails.title}
            onChange={handleChange}
          />

          <label className="form-label"><strong>Status:</strong></label>
          <input
            type="text"
            className="form-control mb-2"
            name="status"
            value={taskDetails.status}
            onChange={handleChange}
          />

          <label className="form-label"><strong>Description:</strong></label>
          <textarea
            className="form-control mb-2"
            name="description"
            rows="3"
            value={taskDetails.description}
            onChange={handleChange}
          ></textarea>

          <label className="form-label"><strong>Project:</strong></label>
          <input
            type="text"
            className="form-control mb-2"
            name="projectName"
            value={taskDetails.projectName}
            onChange={handleChange}
          />
        </div>

        {/* Code editor */}
        <h5 className="mb-3 d-flex align-items-center">
          <FaCode className="me-2 text-primary" /> Code Editor
        </h5>
        <textarea
          className="form-control mb-3"
          rows="10"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write or paste your code here..."
          style={{
            fontFamily: 'monospace',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        ></textarea>

        {/* Submit button */}
        <button
          className="btn btn-primary w-100"
          onClick={handleSubmit}
          disabled={!taskIdFromDashboard || code.trim() === '' || uploading}
        >
          {uploading ? '⏳ Submitting...' : '🚀 Submit Code'}
        </button>
      </div>
    </div>
  );
};

export default CodeSubmissions;
