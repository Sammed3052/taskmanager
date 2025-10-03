// PMDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, Form, Modal, Button } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

const PMDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [pmData, setPmData] = useState(null);

  // --- Notifications ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  };

  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch('http://localhost:5000/api/notifications/read-all', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('❌ Error marking notifications read:', err);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('❌ Error marking all notifications as read:', err);
    }
  };

  // --- Fetch projects ---
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // --- Fetch PM profile ---
  const fetchPMProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/pm/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPmData(response.data);
    } catch (err) {
      console.error('Fetch PM profile error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchPMProfile();
    fetchNotifications();
  }, [location]);

  useEffect(() => {
    let updatedProjects = [...projects];
    if (search) {
      updatedProjects = updatedProjects.filter((proj) =>
        proj.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortBy === 'status') {
      updatedProjects.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === 'deadline') {
      updatedProjects.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    setFilteredProjects(updatedProjects);
  }, [search, sortBy, projects]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const totalProjects = projects.length;
  const pending = projects.filter((p) => p.status === 'Pending').length;
  const inProgress = projects.filter((p) => p.status === 'In Progress').length;
  const completed = projects.filter((p) => p.status === 'Completed').length;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: '#f4faff' }}>
      <div className="d-flex flex-grow-1" style={{ minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <div
          className="border-end shadow-sm p-3"
          style={{
            width: '240px',
            backgroundColor: '#eef2f9',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
          }}
        >
          <h6 className="text-center fw-bold text-secondary mb-4">Navigation</h6>
          <ul className="nav flex-column gap-2">
            <li>
              <button className="btn w-100 text-start text-white fw-semibold" style={{ backgroundColor: '#0d6efd' }}>
                🏠 Home
              </button>
            </li>
            <li>
              <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/create-project')}>
                ➕ Create Project
              </button>
            </li>
            <li>
              <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/assign-task')}>
                📝 Assign Tasks
              </button>
            </li>
            <li>
              <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/team')}>
                👥 Team Management
              </button>
            </li>
            <li>
              <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/review-bugs')}>
                🐞 Review Bugs
              </button>
            </li>
          </ul>
          <button className="btn btn-danger w-100 mt-4" onClick={handleLogout}>
            🔓 Logout
          </button>
        </div>

        {/* Main Content + Navbar */}
        <div className="flex-grow-1" style={{ marginLeft: '240px', display: 'flex', flexDirection: 'column', width: 'calc(100% - 240px)' }}>
          {/* Navbar */}
          <nav className="navbar navbar-light bg-white shadow-sm px-4 py-3">
            <div className="d-flex justify-content-between align-items-center w-100">
              <h5 className="fw-bold text-primary m-0">Welcome back, Project Manager 👋</h5>
              <div className="d-flex align-items-center gap-3">

                {/* Notifications */}
                <div className="position-relative">
                  <button className="btn btn-outline-secondary btn-sm position-relative" onClick={toggleNotifications}>
                    🔔 Notifications
                    {unreadCount > 0 && (
                      <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">{unreadCount}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <div
                      className="position-absolute top-100 end-0 mt-2 p-3 border border-info bg-white rounded shadow"
                      style={{ width: '320px', zIndex: 10, fontFamily: "'Courier New', monospace", borderStyle: 'dashed', backgroundColor: '#f0f9ff' }}
                    >
                      <h6 className="mb-3 text-info fw-bold">🔔 PM Alerts</h6>
                      {notifications.length === 0 ? (
                        <p className="text-muted small">No notifications yet.</p>
                      ) : (
                        <ul className="list-unstyled mb-0">
                          {notifications.map((note, index) => (
                            <li key={note._id || index} className={`mb-2 small ${note.isRead ? 'text-muted' : 'fw-bold text-dark'}`}>
                              ✔️ {note.message}
                              <br />
                              <span className="text-secondary small">{new Date(note.createdAt).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Button variant="link" size="sm" className="mt-2 p-0" onClick={markAllAsRead}>
                        Mark all as read
                      </Button>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    className="d-flex align-items-center bg-white border shadow-sm px-2 py-1 rounded"
                    style={{ minHeight: '45px' }}
                  >
                    <FaUserCircle size={40} className="me-2" style={{ color: '#6c757d', borderRadius: '50%', border: '1px solid #dee2e6', padding: '2px' }} />
                    <span className="fw-semibold">PM</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setShowProfile(true)}>👤 Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>🔓 Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
            {/* Stats */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card shadow-sm border-0 text-white" style={{ backgroundColor: '#0d6efd' }}>
                  <div className="card-body">
                    <h6 className="card-title">Total Projects</h6>
                    <h3>{totalProjects}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm border-0 text-white" style={{ backgroundColor: '#dc3545' }}>
                  <div className="card-body">
                    <h6 className="card-title">Pending</h6>
                    <h3>{pending}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm border-0 text-white" style={{ backgroundColor: '#ffc107' }}>
                  <div className="card-body">
                    <h6 className="card-title">In Progress</h6>
                    <h3>{inProgress}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm border-0 text-white" style={{ backgroundColor: '#198754' }}>
                  <div className="card-body">
                    <h6 className="card-title">Completed</h6>
                    <h3>{completed}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Control type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: '300px' }} />
              <Form.Select onChange={(e) => setSortBy(e.target.value)} value={sortBy} style={{ width: '180px' }}>
                <option value="">Sort By</option>
                <option value="status">Status</option>
                <option value="deadline">Deadline</option>
              </Form.Select>
            </div>

            {/* Projects Grid */}
            <div className="row">
              {filteredProjects.length === 0 ? (
                <div className="text-center text-muted mt-4">No projects found</div>
              ) : (
                filteredProjects.map((project) => (
                  <div className="col-md-4 mb-4" key={project._id}>
                    <div className="card border-0 shadow-sm h-100 bg-white">
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h5 className="card-title">{project.name}</h5>
                          <p className="card-text text-muted">Total Task: {project.totalTasks}</p>
                          <p className="card-text">
                            Status:{" "}
                            <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
                              project.status === 'In Progress' ? 'bg-warning text-dark' :
                              project.status === 'Pending' ? 'bg-danger' : 'bg-secondary'}`}>
                              {project.status}
                            </span>
                          </p>
                          <p className="card-text text-muted">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                        </div>
                        <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => navigate(`/project/${project._id}`)}>View Details</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white text-center py-2 shadow-sm border-top mt-auto">
            <small className="text-muted">
              <img src="/logo192.png" alt="Logo" width="24" className="me-2" />
              © 2025 Project Management System. All rights reserved.
            </small>
          </footer>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered size="md" className="text-center">
        <Modal.Header closeButton>
          <Modal.Title>Project Manager Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pmData && (
            <div className="p-3">
              {pmData.profilePic ? (
                <img src={pmData.profilePic} alt="Profile" className="rounded-circle mb-3" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #0d6efd' }} />
              ) : (
                <FaUserCircle size={80} className="mb-3 text-primary" />
              )}
              <h5 className="fw-bold">{pmData.name}</h5>
              <p className="text-muted mb-1">{pmData.email}</p>
              <p className="text-muted mb-1">{pmData.mobile}</p>
              <p className="text-muted mb-3">{pmData.address || 'N/A'}</p>
              <hr />
              <p className="text-muted small mb-0"><strong>Account Created:</strong> {new Date(pmData.createdAt).toLocaleDateString()}</p>
              <p className="text-muted small"><strong>Last Updated:</strong> {new Date(pmData.updatedAt).toLocaleDateString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfile(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PMDashboard;
