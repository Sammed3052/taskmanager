import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { Modal, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";

const TesterDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");

  // ✅ Notifications (dynamic)
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile state
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  // Fetch tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch("http://localhost:5000/api/tasks/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();
        setTasks(data);

        // ✅ fetch notifications too
        fetchNotifications();
      } catch (err) {
        console.error("Error fetching tester data:", err);
      }
    };

    fetchData();

    // Auto refresh notifications every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  // ✅ Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("❌ Error marking notifications as read:", err);
    }
  };

 const handleNotificationAction = async (notificationId, action, bugId) => {
  try {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/notifications/${notificationId}/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, bugId }),
    });

    // ✅ Update notification instead of removing it
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notificationId ? { ...n, actionTaken: action } : n
      )
    );

    alert(`✅ You ${action}ed the bug!`);
  } catch (err) {
    console.error("❌ Notification action failed:", err);
    alert("❌ Action failed. Try again."); 
  }
};

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/employees/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleProfileOpen = () => {
    fetchProfile();
    setShowProfile(true);
  };
  const handleProfileClose = () => setShowProfile(false);

  const filteredTasks = tasks.filter((task) =>
    filter === "All" ? true : task.status === filter
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleStartTest = (taskId, code) => {
    navigate("/start-test", { state: { code, taskId } });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date set";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "No due date set" : date.toLocaleString();
  };

  return (
    <div
      className="d-flex"
      style={{
        height: "100vh",
        backgroundColor: "#e9f1f7",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3 d-flex flex-column justify-content-between"
        style={{ width: "250px" ,flexShrink: 0 }}
      >
        <div>
          <h4 className="mb-4 border-bottom pb-2">🧪 QA Panel</h4>
          <ul className="nav flex-column gap-3">
            <li>
              <button
                className="btn btn-outline-light w-100 text-start"
                onClick={() => navigate("/tester-dashboard")}
              >
                🏠 Home
              </button>
            </li>
            <li>
              <button
                className="btn btn-outline-light w-100 text-start"
                onClick={() => navigate("/bug-report")}
              >
                📤 Report Bug
              </button>
            </li>
            <li>
              <button
                className="btn btn-outline-light w-100 text-start"
                onClick={() => navigate("/test-status")}
              >
                🧾 Test Status
              </button>
            </li>
            <li>
              <button
                className="btn btn-outline-light w-100 text-start"
                onClick={() => navigate("/task-suggestion")}
              >
                💡 Task Suggestion
              </button>
            </li>
            <li>
              <button
                className="btn btn-outline-light w-100 text-start"
                onClick={handleProfileOpen}
              >
                🙍‍♂️ Profile
              </button>
            </li>
            <li>
              <button
                className="btn btn-outline-light w-100 text-start"
                onClick={() => navigate("/reports")}
              >
                📊 Reports
              </button>
            </li>
          </ul>
        </div>
        <button className="btn btn-danger w-100 mt-3" onClick={handleLogout}>
          🔓 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 overflow-auto">
        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 text-dark">📋 My QA Tasks</h5>
          <div className="d-flex gap-3 align-items-center">
            {/* Filter Dropdown */}
            <select
              className="form-select form-select-sm"
              style={{ width: "160px", fontFamily: "'Courier New', monospace" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Show All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
            </select>

            {/* ✅ Notifications */}
            <div className="position-relative">
              <button
                className="btn btn-outline-secondary btn-sm position-relative"
                onClick={() => setShowNotifications(!showNotifications)}
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
                  <h6 className="mb-3 text-info fw-bold">🔔 QA Alerts</h6>
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

            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="d-flex align-items-center bg-white border shadow-sm px-2 py-1 rounded"
                style={{ minHeight: "45px" }}
              >
                {profile?.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #dee2e6",
                      marginRight: "8px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FaUserCircle
                    size={40}
                    className="me-2"
                    style={{
                      color: "#6c757d",
                      borderRadius: "50%",
                      border: "1px solid #dee2e6",
                      padding: "2px",
                      marginRight: "8px",
                    }}
                  />
                )}
                <span className="fw-semibold">Tester</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleProfileOpen}>
                  👤 View Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowEditProfile(true)}>
                  ✏️ Edit Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>🔓 Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Task Cards */}
        <div className="row g-3">
          {filteredTasks.map((task) => (
            <div className="col-md-6 col-lg-4" key={task._id}>
              <div className="card border-start border-4 shadow-sm bg-white h-100">
                <div className="card-body">
                  <h6 className="card-title text-primary">🧪 {task.title}</h6>
                  <p className="card-text text-muted small">
                    {task.description}
                  </p>
                  <p className="small text-secondary">
                    ⏱ Due: {formatDate(task.dueDate)}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span
                      className={`badge rounded-pill px-3 py-1 ${
                        task.status === "pending"
                          ? "bg-warning text-dark"
                          : task.status === "in-progress"
                          ? "bg-info text-dark"
                          : "bg-success"
                      }`}
                    >
                      {task.status}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={!task.code}
                        onClick={() =>
                          navigate("/view-code", {
                            state: { task, code: task.code },
                          })
                        }
                      >
                        {task.code ? "View Code" : "No Code Yet"}
                      </button>
                     <button
                              className="btn btn-outline-success btn-sm"
                              disabled={!task.code || task.status === "submitted"} // disable if no code OR already submitted
                              onClick={() => handleStartTest(task._id, task.code)}
                            >
                              {task.status === "submitted" ? "Already Submitted" : "Start Test"}
                            </button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center text-muted mt-5">
              No tasks found for "{filter}"
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={handleProfileClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>👤 My Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profile ? (
            <div className="text-center">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className="mb-3 rounded-circle"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaUserCircle size={100} className="mb-3 text-secondary" />
              )}
              <p>
                <strong>Employee ID:</strong> {profile.empId}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Role:</strong> {profile.role}
              </p>
              <p>
                <strong>Status:</strong> {profile.status}
              </p>
              <p>
                <strong>Name:</strong> {profile.name || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {profile.address || "N/A"}
              </p>
              <p>
                <strong>Mobile:</strong> {profile.mobile || "N/A"}
              </p>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleProfileClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        show={showEditProfile}
        onHide={() => setShowEditProfile(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>✏️ Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profile ? (
            <form>
              <div className="mb-3 text-center">
                {profilePicFile ? (
                  <img
                    src={URL.createObjectURL(profilePicFile)}
                    alt="Preview"
                    className="mb-2 rounded-circle"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                ) : profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="mb-2 rounded-circle"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FaUserCircle size={100} className="mb-2 text-secondary" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control form-control-sm mt-2"
                  onChange={(e) => setProfilePicFile(e.target.files[0])}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.address || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Mobile</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.mobile || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, mobile: e.target.value })
                  }
                />
              </div>
            </form>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditProfile(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                const formData = new FormData();
                formData.append("name", profile.name || "");
                formData.append("address", profile.address || "");
                formData.append("mobile", profile.mobile || "");
                if (profilePicFile)
                  formData.append("profilePicture", profilePicFile);

                const res = await fetch(
                  "http://localhost:5000/api/employees/profile",
                  {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                  }
                );

                if (res.ok) {
                  alert("✅ Profile updated!");
                  setShowEditProfile(false);
                  fetchProfile();
                  setProfilePicFile(null);
                } else {
                  alert("❌ Failed to update profile");
                }
              } catch (err) {
                console.error("❌ Error updating profile:", err);
              }
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TesterDashboard;
