import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';



const Home = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
    const [showModal, setShowModal] = useState(false); // ✅ add this

  const titleRef = useRef(null);

  useEffect(() => {
    setLoaded(true);
    if (titleRef.current) {
      setTextWidth(titleRef.current.offsetWidth);
    }
  }, []);

  const handleSelect = (role) => {
    if (role === 'manager') {
      navigate('/login');
    } else if (role === 'employee') {
      navigate('/emplogin');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff, #dceeff)',
        color: '#212529',
        position: 'relative',
        paddingBottom: '60px',
      }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg px-4" style={{ backgroundColor: '#343a40' }}>
  <span
    className="navbar-brand d-flex align-items-center text-white"
    style={{ fontSize: '2rem', fontWeight: 'bold' }}
  >
    <img
      src="/logo.png"
      alt="TaskFlow Logo"
      style={{
        width: '60px',
        height: '60px',
        marginRight: '12px',
        borderRadius: '8px',
      }}
    />
    TaskFlow
  </span>
  

  <div className="ms-auto d-flex align-items-center">
    {/* User Manual Button */}
    <button
      className="btn btn-outline-light "
      style={{ marginRight: '50px' }}
      onClick={() => setShowModal(true)}// navigate to user manual page
    >
      📖 User Manual
    </button>

    {/* Login Dropdown */}
    <div className="dropdown">
      <button
        className="btn btn-light dropdown-toggle"
        type="button"
        id="loginDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Login
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="loginDropdown">
        <li>
          <button className="dropdown-item" onClick={() => handleSelect('manager')}>
            Project Manager
          </button>
        </li>
        <li>
          <button className="dropdown-item" onClick={() => handleSelect('employee')}>
            Employee (Dev/Tester)
          </button>
        </li>
      </ul>
    </div>
  </div>
</nav>
{showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Manual - Prerequisites</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ul>
                  <li>✅ Finalized & approved requirement documents</li>
                  <li>✅ Clearly defined project goals and scope</li>
                  <li>✅ Detailed task breakdown (WBS – Work Breakdown Structure)</li>
                  <li>✅ Team members identified with assigned roles (Developer, Tester)</li>
                  <li>✅ Task assignment plan finalized</li>
                  <li>✅ Project timeline with milestones and due dates set</li>
                </ul>
                <h6 className="mt-4">👥 Roles of Users</h6>
                  <ul>
                    <li><strong>Project Manager:</strong> Assign tasks, manage workflow, review bugs, oversee team.</li>
                    <li><strong>Developer:</strong> Work on assigned tasks, write code, submit for testing.</li>
                    <li><strong>Tester:</strong> Test features, report bugs, validate fixes, ensure quality assurance.</li>
                  </ul>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          ></div>
        </div>
      )}
    


      {/* Main Content */}
      <div className="container text-center mt-5">
        <h1
          className="display-4 fw-bold"
          ref={titleRef}
          style={{ display: 'inline-block' }}
        >
          Welcome to TaskFlow
        </h1>
        <p className="lead">
          Plan smarter. Track better. Collaborate faster — with TaskFlow.
        </p>

        {/* Logo same width as title (with reduced margins) */}
        {textWidth > 0 && (
          <img
            src="/logo.png"
            alt="TaskFlow Logo"
            className={`animated-logo ${loaded ? 'loaded' : ''}`}
            style={{
              width: `${textWidth}px`,
              height: 'auto',
              marginTop: '10px',
              marginBottom: '10px',
              transition: 'all 1s ease',
            }}
          />
        )}

        {/* CTA Button */}
        <div className="mt-3">
          <button
            className="btn btn-primary px-4 py-2"
            onClick={() => navigate('/login')}
          >
            🚀 Get Started Now
          </button>
        </div>

        {/* Role Summary Cards */}
        <div className="row justify-content-center mt-5">
          {[
            {
              icon: '🧑‍💼',
              title: 'Project Manager',
              desc: 'Assign tasks, manage workflow, review bugs, and oversee team collaboration.',
            },
            {
              icon: '👨‍💻',
              title: 'Developer',
              desc: 'Work on assigned tasks, push code updates, and collaborate with testers and PM.',
            },
            {
              icon: '🧪',
              title: 'Tester',
              desc: 'Test features, report bugs, validate fixes, and ensure quality assurance.',
            },
          ].map((role, index) => (
            <div className="col-md-3 mb-4" key={index}>
              <div
                className="text-center p-4 h-100 shadow-sm"
                style={{
                  backgroundColor: '#e2efff',
                  borderRadius: '12px',
                  borderLeft: '4px solid #007bff',
                  borderRight: '4px solid #007bff',
                }}
              >
                <div style={{ fontSize: '50px', marginBottom: '10px' }}>{role.icon}</div>
                <h5 className="fw-bold">{role.title}</h5>
                <p style={{ fontSize: '14px', color: '#333' }}>{role.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chat Help Icon */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <button
          className="btn btn-info rounded-circle px-3 py-2 shadow"
          title="Need Help?"
        >
          💬
        </button>
      </div>

      {/* Footer */}
      <footer
        className="text-center shadow-sm"
        style={{
          marginTop: '40px',
          padding: '10px 0',
          backgroundColor: '#c5dbf2',
          color: '#212529',
          fontWeight: '500',
          fontSize: '15px',
          borderTop: '2px solid #8bb8e8',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div>
          <img
            src="/logo.png"
            alt="TaskFlow Logo"
            style={{
              width: '40px',
              height: '40px',
              marginBottom: '6px',
              verticalAlign: 'middle',
            }}
          />
        </div>
        <div>
          © 2025 <strong style={{ color: '#004085' }}>TaskFlow</strong> — Built for smarter project tracking 🚀
        </div>
      </footer>

      {/* Animation */}
      <style>{`
        .animated-logo {
          opacity: 0;
          transform: scale(0.9);
        }
        .animated-logo.loaded {
          opacity: 1;
          transform: scale(1);
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
};

export default Home;
