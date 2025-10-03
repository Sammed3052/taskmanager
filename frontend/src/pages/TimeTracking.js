import React, { useState } from 'react';

const TimeTracking = () => {
  const [entries, setEntries] = useState([]);
  const [task, setTask] = useState('');
  const [hours, setHours] = useState('');

  const handleAddEntry = () => {
    if (!task || !hours) return alert('Please enter task and hours');
    const newEntry = {
      id: Date.now(),
      task,
      hours: parseFloat(hours),
      date: new Date().toLocaleDateString(),
    };
    setEntries([newEntry, ...entries]);
    setTask('');
    setHours('');
  };

  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-center mb-4">⏱️ Time Tracking</h2>

      {/* Input Form */}
      <div className="card p-4 shadow-sm mb-4">
        <div className="row g-3">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Task Description"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Hours Spent"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" onClick={handleAddEntry}>
              ➕ Add
            </button>
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3">🧾 Logged Entries</h5>
        {entries.length === 0 ? (
          <p className="text-muted">No time entries yet.</p>
        ) : (
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Task</th>
                <th>Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  <td>{entry.date}</td>
                  <td>{entry.task}</td>
                  <td>{entry.hours}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(entry.id)}
                    >
                      ❌ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TimeTracking;
