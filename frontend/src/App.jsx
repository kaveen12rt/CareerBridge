import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import CompanyJobsMain from "./pages/CompanyJobsMain";
import { StudentHome } from "./pages/StudentProfile";

// Admin Dashboard Component
function AdminDashboard() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => {
        setApiStatus(data.message);
        setLoading(false);
      })
      .catch(() => {
        setApiStatus("Backend not reachable");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">CareerBridge - Admin Portal</h1>
        <div className="flex gap-4">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">User Portal</Link>
          <Link to="/admin" className="text-indigo-600 font-semibold">Admin Home</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center mt-20 px-4">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-4 text-center">
          Admin <span className="text-indigo-600">Dashboard</span>
        </h2>
        <p className="text-lg text-gray-500 mb-8 text-center max-w-xl">
          Manage your team's modules - Company Jobs, Student Profiles, Applications, and Job Matching.
        </p>

        {/* API Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Backend Status</h3>
          {loading ? (
            <p className="text-yellow-500 font-medium">Connecting...</p>
          ) : (
            <p className={`text-lg font-bold ${apiStatus === "CareerBridge API is running" ? "text-green-500" : "text-red-500"}`}>
              {apiStatus}
            </p>
          )}
        </div>

        {/* Member Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl w-full">
          {/* Student Profile Module */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 cursor-not-allowed opacity-75">
            <h3 className="text-lg font-bold text-blue-600 mb-1">StudentProfile</h3>
            <p className="text-gray-500 text-sm">Member 1 — Student Account + Profile Management</p>
            <p className="text-xs text-gray-400 mt-2">Coming Soon...</p>
          </div>
          
          {/* Company Jobs Module - CLICKABLE */}
          <div 
            onClick={() => navigate("/admin/company")}
            className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-lg hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105"
          >
            <h3 className="text-lg font-bold text-indigo-600 mb-1">CompanyJobs</h3>
            <p className="text-gray-500 text-sm">Member 2 — Company Dashboard + Job Posting + Interview Slots</p>
            <p className="text-xs text-indigo-500 mt-2 font-semibold">✨ Click to Enter →</p>
          </div>
          
          {/* Job Match Module */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 cursor-not-allowed opacity-75">
            <h3 className="text-lg font-bold text-purple-600 mb-1">JobMatch</h3>
            <p className="text-gray-500 text-sm">Member 3 — Job Search + Smart Matching + CV Generator</p>
            <p className="text-xs text-gray-400 mt-2">Coming Soon...</p>
          </div>
          
          {/* Applications Module */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-pink-500 cursor-not-allowed opacity-75">
            <h3 className="text-lg font-bold text-pink-600 mb-1">Applications</h3>
            <p className="text-gray-500 text-sm">Member 4 — Applications + Interview Booking + Payment</p>
            <p className="text-xs text-gray-400 mt-2">Coming Soon...</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-6 text-center text-gray-400 text-sm">
        © 2026 CareerBridge — ITPM Group Project
      </footer>
    </div>
  );
}

// User Portal Wrapper
function UserPortal() {
  return (
    <div>
      {/* User Portal Navbar */}
      <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">CareerBridge</h1>
        <div className="flex gap-4">
          <Link to="/" className="text-indigo-600 font-semibold">Home</Link>
          <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">Jobs</span>
          <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">Companies</span>
          <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">My Applications</span>
          <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin Portal</Link>
        </div>
      </nav>
      <StudentHome />
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center">
        <p>© 2026 CareerBridge — ITPM Group Project</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* User Portal Routes */}
        <Route path="/" element={<UserPortal />} />
        
        {/* Admin Portal Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/company" element={<CompanyJobsMain />} />
      </Routes>
    </Router>
  );
}

export default App;
