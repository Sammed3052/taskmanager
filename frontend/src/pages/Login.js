import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/pm/login ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Login successful');

        localStorage.setItem('token', data.token);
        localStorage.setItem('pmId', data.pm.pmId);
        localStorage.setItem('pmName', data.pm.name);
        localStorage.setItem('pmEmail', data.pm.email);

        navigate('/PMdashboard');
      } else {
        alert(data.error || '❌ Invalid credentials');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 text-primary">Project Manager Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-2">
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

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        {/* ✅ Forgot password link */}
        <div className="mt-2 text-center">
          <button 
            className="btn btn-link p-0" 
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-3 text-center">
          <span>Don’t have an account? </span>
          <button className="btn btn-link p-0" onClick={() => navigate('/register')}>
            Register New User
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
