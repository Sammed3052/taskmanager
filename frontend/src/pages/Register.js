import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    address: '',       // optional
    captchaInput: ''
  });

  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [captcha, setCaptcha] = useState('');

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setProfilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check mandatory fields
    const { name, email, password, confirmPassword, mobile, captchaInput } = formData;
    if (!name || !email || !password || !confirmPassword || !mobile || !captchaInput || !profilePic) {
      alert('❌ All fields except Address are required');
      return;
    }

    if (password !== confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }

    if (captchaInput !== captcha) {
      alert('❌ Incorrect captcha');
      generateCaptcha();
      return;
    }

    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('password', password);
    data.append('mobile', mobile);
    if (formData.address) data.append('address', formData.address);
    data.append('profilePic', profilePic);

    try {
      const response = await fetch('http://localhost:5000/api/pm/register', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token || '');
        alert('✅ Registered successfully!');
        navigate('/PMdashboard');
      } else {
        alert(`❌ ${result.error || 'Registration failed'}`);
        generateCaptcha();
      }
    } catch (error) {
      console.error('❌ Registration Error:', error);
      alert('❌ Server error. Try again later.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 className="text-center mb-4 text-success">New PM Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mobile Number *</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Address (optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Profile Picture *</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleProfileChange}
            />
            {profilePreview && (
              <img
                src={profilePreview}
                alt="Profile Preview"
                className="mt-2"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
              />
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Create password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Captcha *</label>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="border rounded px-3 py-2 bg-light text-dark fw-bold"
                style={{ fontSize: '18px' }}
              >
                {captcha}
              </div>
              <button type="button" className="btn btn-sm btn-secondary" onClick={generateCaptcha}>
                Refresh
              </button>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Enter captcha code above"
              value={formData.captchaInput}
              onChange={(e) => setFormData({ ...formData, captchaInput: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
            Register New PM
          </button>
        </form>

        <div className="mt-3 text-center">
          <span>Already registered? </span>
          <button className="btn btn-link p-0" onClick={() => navigate('/')}>
            Login here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
