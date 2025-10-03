import React, { useState } from 'react';

const AssignRoles = () => {
  const [team, setTeam] = useState([
    {
      id: 1,
      name: 'Alice',
      role: 'Developer',
      project: 'Project Alpha',
      task: 'Build Login Page',
      status: 'Completed',
    },
    {
      id: 2,
      name: 'Bob',
      role: 'Tester',
      project: 'Project Beta',
      task: 'Test Dashboard',
      status: 'Pending',
    },
    {
      id: 3,
      name: 'Charlie',
      role: '',
      project: '',
      task: '',
      status: '',
    },
  ]);

  const handleRemove = (id) => {
    const updatedTeam = team.map((member) =>
      member.id === id
        ? {
            ...member,
            role: '',
            project: '',
            task: '',
            status: '',
          }
        : member
    );
    setTeam(updatedTeam);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">🧑‍💻 Team Roles & Task Overview</h2>

      <div className="card p-3 shadow-sm">
        <table className="table table-bordered align-middle text-center">
          <thead className="table-dark text-white">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Role</th>
              <th>Project</th>
              <th>Task</th>
              <th>Status</th>
              <th>Remove Role</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member, index) => (
              <tr key={member.id}>
                <td>{index + 1}</td>
                <td>{member.name}</td>
                <td>{member.role || 'Unassigned'}</td>
                <td>{member.project || 'N/A'}</td>
                <td>{member.task || 'N/A'}</td>
                <td>
                  <span
                    className={`badge ${
                      member.status === 'Completed'
                        ? 'bg-success'
                        : member.status === 'Pending'
                        ? 'bg-warning text-dark'
                        : 'bg-secondary'
                    }`}
                  >
                    {member.status || 'Unassigned'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemove(member.id)}
                  >
                    ❌ Clear Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignRoles;
