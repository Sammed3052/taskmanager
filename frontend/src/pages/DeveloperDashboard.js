// DeveloperDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, Button, Dropdown, Form } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
   
    fetchNotifications();
  }, []);

  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch("http://localhost:5000/api/notifications/read-all", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("❌ Error marking notifications read:", err);
      }
    }
  };
   const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submittedTasks, setSubmittedTasks] = useState(new Set());

  const [showProfile, setShowProfile] = useState(false);
  const [devData, setDevData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: ''
  });
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState('');

  // ------------------ FETCH TASKS ------------------
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${baseUrl}/api/tasks/assigned`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formattedTasks = res.data.map(task => ({
          ...task,
          status: task.status || 'Pending',
          projectName: task.projectName || 'N/A',
          assignedBy: task.assignedBy || 'N/A',
          isSubmitted: !!task.code
        }));
        setTasks(formattedTasks);
        setFilteredTasks(formattedTasks);

        const submissions = new Set();
        for (const task of formattedTasks) {
          if (task.status === 'In Progress' || task.status === 'Submitted') {
            submissions.add(task._id);
          }
        }
        setSubmittedTasks(submissions);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate, location]);

  // ------------------ FETCH PROFILE ------------------
  const fetchDevProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/employees/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevData(res.data);
      setFormData({
        name: res.data.name || '',
        mobile: res.data.mobile || '',
        address: res.data.address || ''
      });
      setPreview(res.data.profilePhoto || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // ------------------ SAVE PROFILE ------------------
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('mobile', formData.mobile);
      data.append('address', formData.address);
      if (profileFile) data.append('profilePicture', profileFile);

      const res = await axios.patch('http://localhost:5000/api/employees/profile', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setDevData(res.data.employee);
      setIsEditing(false);
      setProfileFile(null);
      setPreview(res.data.employee.profilePhoto || '');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

   // ✅ Mark all notifications as read
const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.patch(
      "http://localhost:5000/api/notifications/read-all",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update local state after marking as read
    fetchNotifications();
  } catch (err) {
    console.error("❌ Error marking notifications as read:", err);
  }
};


  // ------------------ FILTER TASKS ------------------
  useEffect(() => {
    let updatedTasks = [...tasks];
    if (search) updatedTasks = updatedTasks.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) updatedTasks = updatedTasks.filter(t => t.status === statusFilter);
    setFilteredTasks(updatedTasks);
  }, [search, statusFilter, tasks]);

  // ------------------ TASK STATS ------------------
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' && !t.isSubmitted).length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress' && t.isSubmitted).length;
  const completedTasks = tasks.filter(t => t.status === 'submitted').length;

  // ------------------ HANDLERS ------------------
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setShowModal(false);
  };

  const openProfile = (edit = false) => {
    fetchDevProfile();
    setIsEditing(edit);
    setShowProfile(true);
  };

  const getFileLink = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${url}`;
  };

  // ------------------ JSX ------------------
  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div
        className="border-end shadow-sm p-3"
        style={{
          width: '300px',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          backgroundColor: '#37215710',
          zIndex: 1000,
        }}
      >
        <h6 className="text-center fw-bold text-secondary mb-4" style={{ fontSize: '2rem' }}>
          👨‍💻 Developer Dashboard
        </h6>
        <ul className="nav flex-column gap-2">
          <li>
            <button
              className="btn w-100 text-start text-white fw-semibold"
              style={{ backgroundColor: '#0d6efd' }}
              onClick={() => navigate('/developer-dashboard')}
            >
              🏠 Home
            </button>
          </li>
          <li>
            <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/bug-feedback')}>
              🐞 Reported Bug
            </button>
          </li>
          <li>
            <button className="btn btn-outline-primary w-100 text-start" onClick={() => navigate('/raise-suggestion')}>
              💡 Raise Suggestion
            </button>
          </li>
          <li>
             <button className="btn btn-danger w-100 mt-4" onClick={handleLogout}>
            🔓 Logout
          </button>
       
          </li>
        </ul>
      </div>

      {/* Main Layout with footer pinned bottom */}
      <div className="d-flex flex-column min-vh-100" style={{ marginLeft: '300px', width: 'calc(100% - 300px)' }}>
        {/* Navbar */}
     
<nav className="navbar shadow-sm px-4 py-3" style={{ backgroundColor: '#37215710' }}>
  <div className="d-flex justify-content-between align-items-center w-100">
    <h5 className="fw-bold mb-0">👨‍💻 Welcome To TaskFlow</h5>

    {/* Right side buttons */}
    <div className="d-flex align-items-center gap-3">
    <div className="d-flex align-items-center gap-2">
  <input
    type="text"
    className="form-control"
    placeholder="Search tasks..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{ maxWidth: '160px' }}
  />
  <select
    className="form-select"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    style={{ width: '160px', borderStyle: "dashed" }}
  >
    <option value="">Filter by Status</option>
    <option value="pending">Pending</option>
    <option value="in-progress">In Progress</option>
    <option value="submitted">Completed</option>
  </select>
</div>

      {/* Notifications */}
        <div className="position-relative">
                    <button
                      className="btn btn-outline-secondary btn-sm position-relative"
                      onClick={() => setShowNotifications(!showNotifications)}
                       style={{ width: '160px',  }}
                    >
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div
                        className="position-absolute top-100 end-0 mt-2 p-3 border border-info bg-white rounded shadow"
                        style={{
                          width: "320px",
                          zIndex: 10,
                          fontFamily: "'Courier New', monospace",
                          borderStyle: "dashed",
                          backgroundColor: "#f0f9ff",
                        }}
                      >
                        <h6 className="mb-3 text-info fw-bold">🔔 DEV Alerts</h6>
                        {notifications.length === 0 ? (
                          <p className="text-muted small">No notifications yet.</p>
                        ) : (
                          <ul className="list-unstyled mb-0">
                            {notifications.map((note, index) => (
                              <li
                                key={note._id || index}
                                className={`mb-2 small ${
                                  note.isRead ? "text-muted" : "fw-bold text-dark"
                                }`}
                              >
                                ✔️ {note.message}
                                <br />
                                <span className="text-secondary small">
                                  {new Date(note.createdAt).toLocaleString()}
                                </span>
                               {/* ✅ Show buttons only if no action taken yet */}
                                  {note.actions?.length > 0 && !note.actionTaken ? (
                                    <div className="mt-1 d-flex gap-2">
                                      {note.actions.includes("Accept") && (
                                        <button
                                          className="btn btn-success btn-sm"
                                          onClick={() => handleNotificationAction(note._id, "Accept", note.bugId)}
                                        >
                                          Accept
                                        </button>
                                      )}
                                      {note.actions.includes("Reject") && (
                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() => handleNotificationAction(note._id, "Reject", note.bugId)}
                                        >
                                          Reject
                                        </button>
                                      )}
                                    </div>
                                  ) : note.actionTaken && (
                                    <span
                                      className={`badge ${
                                        note.actionTaken === "Accept" ? "bg-success" : "bg-danger"
                                      }`}
                                    >
                                      {note.actionTaken === "Accept" ? "✅ Accepted" : "❌ Rejected"}
                                    </span>
                                  )}
      
                              </li>
                            ))}
                          </ul>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 p-0"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </Button>
                      </div>
                    )}
                  </div>

      {/* Profile */}
          <div
        className="d-flex flex-column align-items-center ms-4"
        style={{ cursor: "pointer",  width: '60px' }}
        onClick={() => openProfile(false)}
      >
        <FaUserCircle size={35} />
        <span style={{ fontSize: "1rem", marginTop: "4px" }}>Dev</span>
      </div>
          
          </div>
        </div>
    </nav>


        {/* Content */}
        <div className="flex-grow-1 p-4">
          {/* Stats */}
          <div className="row mb-4">
            {[{ label: 'Total Tasks', value: totalTasks, color: '#0d6efd' },
              { label: 'Pending', value: pendingTasks, color: '#ffc107' },
              { label: 'In Progress', value: inProgressTasks, color: '#0dcaf0' },
              { label: 'Completed', value: completedTasks, color: '#198754' }]
              .map((stat, idx) => (
                <div className="col-md-3" key={idx}>
                  <div className="card shadow-sm border-0 text-white" style={{ backgroundColor: stat.color }}>
                    <div className="card-body">
                      <h6 className="card-title">{stat.label}</h6>
                      <h3>{stat.value}</h3>
                    </div>
                  </div>
                </div>
              ))}
          </div>

        

          {/* Task Cards */}
          {loading ? <div className="text-center">Loading tasks...</div> :
            filteredTasks.length === 0 ? <div className="text-center text-muted">No tasks found</div> :
            <div className="row">
              {filteredTasks.map(task => (
                <div className="col-md-4 mb-4" key={task._id}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h5 className="card-title">{task.title}</h5>
                        <p className="card-text text-muted">
                          Status: <span className={`badge ${task.status === 'Completed' ? 'bg-success' : task.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'} ms-1`}>{task.status}</span>
                        </p>
                        <p className="card-text text-muted">Task ID: {task._id}</p>
                      </div>
                      <div className="d-flex justify-content-between mt-2">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleViewDetails(task)}>View Details</button>
                        {task.isSubmitted ? (
                          <span className="badge bg-success align-self-center">✅ Submitted</span>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => navigate(`/code-submissions?taskId=${task._id}`)}
                          >
                            Submit Code
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>}
        </div>

        {/* Footer pinned bottom */}
        <footer className="bg-white text-center py-2 shadow-sm border-top mt-auto">
          <small className="text-muted">
            <img src="/logo192.png" alt="Logo" width="24" className="me-2" />
            © 2025 Developer Dashboard. All rights reserved.
          </small>
        </footer>
      </div>

      {/* Task Modal */}
      {showModal && selectedTask && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedTask.title}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Task ID:</strong> {selectedTask._id}</p>
                <p><strong>Description:</strong> {selectedTask.description || 'No description'}</p>
                <p><strong>Status:</strong> {selectedTask.status}</p>
                <p><strong>Due Date:</strong> {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'N/A'}</p>
                {selectedTask.documentUrl ? <p><strong>Document:</strong> <a href={getFileLink(selectedTask.documentUrl)} target="_blank" rel="noreferrer">View File</a></p> :
                  <p><strong>Document:</strong> No file uploaded</p>}
                <p><strong>Project:</strong> {selectedTask.projectName}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Profile' : 'Profile'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {devData ? (
            isEditing ? (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Photo</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    setProfileFile(file);
                    setPreview(URL.createObjectURL(file));
                  }} />
                </Form.Group>
                <div className="text-center mb-3">
                  {preview ? <img src={preview} alt="Preview" className="rounded-circle" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #0d6efd' }} /> :
                    devData.profilePhoto ? <img src={devData.profilePhoto} alt="Profile" className="rounded-circle" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #0d6efd' }} /> :
                      <FaUserCircle size={80} className="text-primary" />}
                </div>
              </Form>
            ) : (
              <div className="p-3 text-center">
                {devData.profilePhoto ? <img src={devData.profilePhoto} alt="Profile" className="rounded-circle mb-3" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #0d6efd' }} /> :
                  <FaUserCircle size={80} className="mb-3 text-primary" />}
                <h5 className="fw-bold">{devData.name || devData.empId}</h5>
                <p className="text-muted mb-1">{devData.email}</p>
                <p className="text-muted mb-1">{devData.mobile || 'N/A'}</p>
                <p className="text-muted mb-3">{devData.address || 'N/A'}</p>
                <hr />
                <p className="text-muted small mb-0"><strong>Role:</strong> {devData.role}</p>
                <p className="text-muted small mb-0"><strong>Account Created:</strong> {new Date(devData.createdAt).toLocaleDateString()}</p>
                <p className="text-muted small"><strong>Last Updated:</strong> {new Date(devData.updatedAt).toLocaleDateString()}</p>
              </div>
            )
          ) : <p>Loading profile...</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfile(false)}>Close</Button>
                    {isEditing ? (
            <Button variant="primary" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeveloperDashboard;

