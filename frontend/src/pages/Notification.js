import React, { useState } from 'react';

const Notification = () => {
  const [notifications] = useState([
    {
      id: 1,
      sender: 'Project Manager',
      message: 'Submit daily report by 5 PM.',
      time: 'Just now',
    },
    {
      id: 2,
      sender: 'Tester',
      message: 'Bug found in the TaskFlow module.',
      time: '10 minutes ago',
    },
    {
      id: 3,
      sender: 'Project Manager',
      message: 'Update progress on login feature.',
      time: '1 hour ago',
    },
    {
      id: 4,
      sender: 'Tester',
      message: 'Please verify bug fix before marking complete.',
      time: 'Today, 11:20 AM',
    },
  ]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 fw-bold">🔔 Notifications</h2>
      <div className="card shadow-sm">
        <ul className="list-group list-group-flush">
          {notifications.length > 0 ? (
            notifications.map((note) => (
              <li key={note.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{note.sender}:</strong> {note.message}
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {note.time}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="list-group-item text-center text-muted">
              No new notifications.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Notification;
