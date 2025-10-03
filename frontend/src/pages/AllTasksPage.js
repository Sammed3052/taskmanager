// src/pages/AllTasksPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function AllTasksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-6">
      <h1 className="text-2xl font-bold">📋 All Tasks Page</h1>

      {/* Button to navigate to Complete Task page */}
      <button
        className="btn btn-outline-primary w-60 text-center"
        onClick={() => navigate('/complete-task')}
      >
        ✅ Go to Complete Task
      </button>

      {/* Button to navigate to Home page */}
      <button
        className="btn btn-outline-secondary w-60 text-center"
        onClick={() => navigate('/')}
      >
        🏠 Go to Home
      </button>
    </div>
  );
}

export default AllTasksPage;
