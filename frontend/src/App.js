import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmpLogin from './pages/EmpLogin'; 
import PMDashboard from './pages/PMDashboard';
import CreateProject from './pages/CreateProject';
import AssignTask from './pages/AssignTask';
import ReviewBugs from './pages/ReviewBugs';
import TeamManagement from './pages/TeamManagement';
import AssignRoles from './pages/AssignRoles';
import DeveloperDashboard from './pages/DeveloperDashboard';
import TimeTracking from './pages/TimeTracking';
import Notification from './pages/Notification';
import CodeSubmissions from './pages/CodeSubmissions';
import PMDeploy from './pages/PMDeploy';
import  TesterDashboard  from './pages/TesterDashboard';
import StartTestPage from './pages/StartTestPage';
import BugReportPage from './pages/BugReportPage';
import ViewCodePage from './pages/ViewCodePage';
import TestStatusPage from './pages/TestStatusPage';
import BugFeedbackPage from './pages/BugFeedbackPage';
import ForgotPassword from './pages/ForgotPassword';
import TaskSuggestion from './pages/TaskSuggestion';
import RaiseSuggestion from "./pages/RaiseSuggestion";
import ModifyCode from './pages/ModifyCode'; // ✅ Correct import
import Reports from './pages/Reports'; // 👈 New reports page import
import PMProfile from "./pages/PMProfile";
import ProjectDetails from "./pages/ProjectDetails";
import AllTasksPage from './pages/AllTasksPage';


function App() {
   
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* 🏠 Default route */}
        <Route path="/login" element={<Login />} /> {/* 🔐 Project Manager login */}
        <Route path="/register" element={<Register />} /> {/* 📝 Employee registration */}
        <Route path="/emplogin" element={<EmpLogin />} /> {/* ✅ Employee login */}
        <Route path="/PMdashboard" element={<PMDashboard />} /> {/* ✅ Actual PM content dashboard */}
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/assign-task" element={<AssignTask />} />
        <Route path="/review-bugs" element={<ReviewBugs />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/assign-roles" element={<AssignRoles />} />
        <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
        <Route path="/time-tracking" element={<TimeTracking />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/code-submissions" element={<CodeSubmissions />} />
        <Route path="/deploy" element={<PMDeploy />} />
        <Route path="/tester-dashboard" element={<TesterDashboard />} />
        <Route path="/start-test" element={<StartTestPage />} />
        <Route path="/bug-report" element={<BugReportPage />} />
        <Route path="/view-code" element={<ViewCodePage />} />
        <Route path="/test-status" element={<TestStatusPage />} />
        <Route path="/bug-feedback" element={<BugFeedbackPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/task-suggestion" element={<TaskSuggestion />} />
        <Route path="/raise-suggestion" element={<RaiseSuggestion />} />
        <Route path="/modify-code" element={<ModifyCode />} />
        <Route path="/reports" element={<Reports />} /> {/* 👈 reports route */}
        <Route path="/pm-profile" element={<PMProfile />} />
        <Route path="/project/:projectId" element={<ProjectDetails />} />
        <Route path="/all-tasks" element={<AllTasksPage />} />
        

      </Routes>
    </Router>
  );
}

export default App;
