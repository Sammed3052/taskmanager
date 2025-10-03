import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeamManagement = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [newMember, setNewMember] = useState({
    empId: '',
    password: '',
    role: '',
    email: '', // ✅ added email
  });

  // 🔁 Fetch team members
  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/employees', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTeam(res.data);
    } catch (err) {
      console.error('Error fetching team:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // ➕ Add new member
  const handleAddMember = async () => {
    const { empId, password, role, email } = newMember; // ✅ include email
    if (!empId || !password || !role || !email) {
      alert('Please fill all fields!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/employees',
        { empId, password, role, email }, // ✅ include email in POST request
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedMember = res.data;
      setTeam((prev) => [...prev, { ...savedMember, status: 'Active' }]);
      setNewMember({ empId: '', password: '', role: '', email: '' }); // ✅ reset email
    } catch (err) {
      console.error('Error saving member:', err.response?.data || err.message);
      alert('Failed to add member. Please check backend/server.');
    }
  };

  // 🔁 Change status of a member
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:5000/api/employees/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchTeam(); // Refresh team list after status change
    } catch (err) {
      console.error('Error updating status:', err.response?.data || err.message);
    }
  };

  // ❌ Remove member
  const handleRemoveMember = async (id, empId) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove employee ${empId}?`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh team after removal
      await fetchTeam();
    } catch (err) {
      console.error('Error removing member:', err.response?.data || err.message);
      alert('Failed to remove member.');
    }
  };

  return (
    <div className="container mt-5">
      {/* Back to Dashboard Button */}
      <div className="mb-4">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/PMdashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>

      <h2 className="mb-4 text-center fw-bold">👥 Team Management</h2>

      {/* Add Member Form */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5 className="mb-3 fw-semibold">Add New Member</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              placeholder="Employee Email"
              value={newMember.email}
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
              }
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Employee ID"
              value={newMember.empId}
              onChange={(e) =>
                setNewMember({ ...newMember, empId: e.target.value })
              }
            />
          </div>
          <div className="col-md-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={newMember.password}
              onChange={(e) =>
                setNewMember({ ...newMember, password: e.target.value })
              }
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newMember.role}
              onChange={(e) =>
                setNewMember({ ...newMember, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
            </select>
          </div>
          <div className="col-md-1 d-grid">
            <button className="btn btn-primary" onClick={handleAddMember}>
              ➕
            </button>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="card p-4 shadow-sm">
        <h5 className="mb-3 fw-semibold">Current Team</h5>
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Employee ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.length === 0 ? (
              <tr>
                <td colSpan="6">No team members added yet.</td>
              </tr>
            ) : (
              team.map((member, index) => (
                <tr key={member._id}>
                  <td>{index + 1}</td>
                  <td>{member.empId}</td>
                  <td>{member.email}</td>
                  <td>{member.role}</td>
                  <td>
                    <select
                      className="form-select"
                      value={member.status}
                      onChange={(e) => {
                        const selectedStatus = e.target.value;
                        if (selectedStatus === member.status) return;
                        if (selectedStatus === 'Inactive') {
                          const confirmInactive = window.confirm(
                            `Are you sure you want to mark ${member.empId} as Inactive?`
                          );
                          if (confirmInactive) handleStatusChange(member._id, 'Inactive');
                        } else {
                          handleStatusChange(member._id, 'Active');
                        }
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveMember(member._id, member.empId)}
                    >
                      🗑 Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamManagement;
