import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!empId || !password || !role) {
      alert('All fields are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/employees/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ empId, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
      alert(data.error || 'Login failed.');
      return;
      }

      // You can store token or user data if returned
      localStorage.setItem('token', data.token);

      if (role.toLowerCase() === 'developer') {
      navigate('/developer-dashboard');
      } else if (role.toLowerCase() === 'tester') {
      navigate('/tester-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong during login.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 text-primary">Employee Login</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              className="form-control"
              required
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              placeholder="Enter your Employee ID"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Select Role</label>
            <select
              className="form-select"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">-- Choose Role --</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
