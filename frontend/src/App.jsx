import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import CompanyJobsMain from "./pages/CompanyJobs/CompanyJobsMain";
import JobDetails from "./pages/CompanyJobs/JobDetails";
import StudentHome from "./pages/StudentProfile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import StudentProfileDashboard from "./pages/StudentProfileDashboard";
import FeedbackPage from "./pages/FeedbackPage";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
import ContactUsPage from "./pages/ContactUsPage";

import JobSearch from "./pages/JobMatch/JobSearch";
import SmartMatching from "./pages/JobMatch/SmartMatching";
import CVGenerator from "./pages/JobMatch/CVGenerator";
import MyApplications from "./pages/JobMatch/MyApplications";
import ApplicationsDashboard from "./pages/JobMatch/ApplicationsDashboard";

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
      <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">
          CareerBridge - Admin Portal
        </h1>
        <div className="flex gap-4">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">
            User Portal
          </Link>
          <Link to="/admin" className="text-indigo-600 font-semibold">
            Admin Home
          </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center mt-20 px-4">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-4 text-center">
          Admin <span className="text-indigo-600">Dashboard</span>
        </h2>
        <p className="text-lg text-gray-500 mb-8 text-center max-w-xl">
          Manage your team&apos;s modules - Company Jobs, Student Profiles,
          Applications, and Job Matching.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
            Backend Status
          </h3>
          {loading ? (
            <p className="text-yellow-500 font-medium">Connecting...</p>
          ) : (
            <p
              className={`text-lg font-bold ${
                apiStatus === "CareerBridge API is running"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {apiStatus}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl w-full">
          <div
            onClick={() => navigate("/admin/student-profile")}
            className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
          >
            <h3 className="text-lg font-bold text-blue-600 mb-1">
              StudentProfile
            </h3>
            <p className="text-gray-500 text-sm">
              Member 1 — Student Account + Profile Management
            </p>
            <p className="text-xs text-blue-500 mt-2 font-semibold">
              ✨ Click to Enter →
            </p>
          </div>

          <div
            onClick={() => navigate("/admin/company")}
            className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-lg hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105"
          >
            <h3 className="text-lg font-bold text-indigo-600 mb-1">
              CompanyJobs
            </h3>
            <p className="text-gray-500 text-sm">
              Member 2 — Company Dashboard + Job Posting + Interview Slots
            </p>
            <p className="text-xs text-indigo-500 mt-2 font-semibold">
              ✨ Click to Enter →
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 opacity-90">
            <h3 className="text-lg font-bold text-purple-600 mb-1">
              JobMatch
            </h3>
            <p className="text-gray-500 text-sm">
              Member 3 — Job Search + Smart Matching + CV Generator
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/applications')}
            className="bg-white rounded-xl shadow p-6 border-l-4 border-pink-500 cursor-pointer hover:shadow-lg hover:bg-pink-50 transition-all duration-200 transform hover:scale-105"
          >
            <h3 className="text-lg font-bold text-pink-600 mb-1">
              Applications
            </h3>
            <p className="text-gray-500 text-sm">
              Member 4 — Applications + Interview Booking + Payment
            </p>
            <p className="text-xs text-pink-500 mt-2 font-semibold">
              ✨ Click to Enter →
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-6 text-center text-gray-400 text-sm">
        © 2026 CareerBridge — ITPM Group Project
      </footer>
    </div>
  );
}

function UserMenu({ currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const initials = `${currentUser.firstName?.[0] || ""}${
    currentUser.lastName?.[0] || ""
  }`.toUpperCase();

  const fullName =
    `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const goToChangePassword = () => {
    setOpen(false);
    navigate("/change-password");
  };

  const handleLogoutClick = async () => {
    setOpen(false);
    await onLogout();
  };

  return (
    <div className="flex items-center gap-4 relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition"
      >
        <span className="hidden md:block font-bold text-slate-700 uppercase tracking-wide">
          {fullName}
        </span>

        <span className="text-slate-500 text-sm">{open ? "▴" : "▾"}</span>

        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 text-2xl font-bold">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-20 w-72 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden">
          <button
            onClick={goToProfile}
            className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition"
          >
            Profile
          </button>

          <button
            onClick={goToChangePassword}
            className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition"
          >
            Change Password
          </button>

          <div className="border-t border-gray-200" />

          <button
            onClick={handleLogoutClick}
            className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <span>↪</span>
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

function UserPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/check-auth", {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data?.data?.user) {
          setCurrentUser(data.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setCurrentUser(null);
      navigate("/");
    }
  };

  return (
    <div>
      <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">CareerBridge</h1>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-indigo-600 font-semibold">
              Home
            </Link>
            <Link to="/jobs" className="text-gray-600 hover:text-indigo-600">
              Jobs
            </Link>
            <Link
              to="/smart-matching"
              className="text-gray-600 hover:text-indigo-600"
            >
              Smart Matching
            </Link>
            <Link
              to="/cv-generator"
              className="text-gray-600 hover:text-indigo-600"
            >
              CV Generator
            </Link>
            <Link to="/my-applications" className="text-gray-600 hover:text-indigo-600">
              My Applications
            </Link>
            <Link to="/feedback" className="text-gray-600 hover:text-indigo-600">
              Feedback
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-indigo-600">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {checkingAuth ? (
            <span className="text-gray-500">Loading...</span>
          ) : currentUser ? (
            <UserMenu currentUser={currentUser} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/signin" className="text-gray-600 hover:text-indigo-600">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <StudentHome />

      <footer className="bg-gray-800 text-white py-6 text-center">
        <p>© 2026 CareerBridge — ITPM Group Project</p>
      </footer>
    </div>
  );
}

function AppContent() {
  const location = useLocation();

  const hideChatbotRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/change-password",
    "/admin",
    "/admin/company",
    "/admin/student-profile",
  ];

  const shouldHideChatbot =
    hideChatbotRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  return (
    <>
      <Routes>
        <Route path="/" element={<UserPortal />} />
        <Route path="/jobs" element={<JobSearch />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/smart-matching" element={<SmartMatching />} />
        <Route path="/cv-generator" element={<CVGenerator />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/admin/applications" element={<ApplicationsDashboard />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/company" element={<CompanyJobsMain />} />
        <Route
          path="/admin/student-profile"
          element={<StudentProfileDashboard />}
        />
        <Route path="/contact" element={<ContactUsPage />} />
      </Routes>

      {!shouldHideChatbot && <ChatbotWidget />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;