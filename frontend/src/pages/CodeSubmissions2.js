import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaInfoCircle, FaTasks } from 'react-icons/fa';
import axios from 'axios';

const CodeSubmissions = () => {
  const [code, setCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const navigate = useNavigate();

  // Fetch tasks on page load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
const res = await axios.get('http://localhost:5000/api/tasks/assigned', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
        setTasks(res.data || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  const handleSubmit = async () => {
    if (!selectedTask) {
      alert('❌ Please select a task.');
      return;
    }
    if (code.trim() === '') {
      alert('❌ Please write or paste your code before submitting.');
      return;
    }

    try {
      setUploading(true);
      const res = await axios.post('http://localhost:5000/api/submissions', {
        taskId: selectedTask,
        code,
      });

      alert(res.data.message || '✅ Submission successful!');
      navigate('/developer-dashboard'); // Redirect after success
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || '❌ Submission failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-center mb-4">📤 Code Submission</h2>

      {/* Instruction */}
      <div className="alert alert-info d-flex align-items-center">
        <FaInfoCircle className="me-2" />
        <span>
          Select the task and submit your <strong>code </strong>.
        </span>
      </div>

      <div className="card shadow-lg p-4 border-0" style={{ borderRadius: '12px' }}>
        {/* Task selector */}
        <h5 className="mb-3 d-flex align-items-center">
          <FaTasks className="me-2 text-success" /> Select Task
        </h5>
        <select
          className="form-select mb-3"
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
        >
          <option value="">-- Select Task --</option>
          {tasks.map((task) => (
            <option key={task._id} value={task._id}>
              {task.title}
            </option>
          ))}
        </select>

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
          disabled={!selectedTask || code.trim() === '' || uploading}
        >
          {uploading ? '⏳ Submitting...' : '🚀 Submit Code'}
        </button>
      </div>
    </div>
  );
};

export default CodeSubmissions;
