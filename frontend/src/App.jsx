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
import adminHero from "./assets/admin-hero.jpg";

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
    <div className="min-h-screen bg-white">
      <nav className="bg-white/90 backdrop-blur border-b border-blue-100 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">
          CareerBridge - Admin Portal
        </h1>
        <div className="flex gap-4 text-sm font-semibold">
          <Link to="/" className="text-slate-500 hover:text-blue-900 transition">
            User Portal
          </Link>
          <Link to="/admin" className="text-blue-900">
            Admin Home
          </Link>
        </div>
      </nav>

      <section
        className="relative overflow-hidden bg-blue-900"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.88)), url(${adminHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="admin-blob admin-blob-left" aria-hidden="true" />
        <div className="admin-blob admin-blob-right" aria-hidden="true" />
        <div className="admin-dots" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-center">
          <div className="text-white admin-fade-up">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-200 bg-white/10 px-3 py-1 rounded-full">
              Admin Workspace
            </p>
            <h2 className="text-5xl font-extrabold mt-5">
              Admin <span className="text-orange-300">Dashboard</span>
            </h2>
            <p className="text-blue-100 mt-4 max-w-2xl">
              Manage your team&apos;s modules - Company Jobs, Student Profiles, Applications, and Job Matching.
            </p>

            <div className="mt-8 inline-flex items-center gap-4 bg-white/10 border border-white/10 rounded-2xl px-6 py-4 shadow-xl admin-fade-up">
              <span className="admin-pulse-dot" />
              <div>
                <p className="text-xs font-semibold uppercase text-blue-100">Backend Status</p>
                {loading ? (
                  <p className="text-orange-200 font-semibold">Connecting...</p>
                ) : (
                  <p className={`text-lg font-bold ${apiStatus === "CareerBridge API is running" ? "text-emerald-300" : "text-orange-300"}`}>
                    {apiStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="admin-illustration" aria-hidden="true">
            <div className="admin-ill-card" />
            <div className="admin-ill-ring" />
            <div className="admin-ill-line" />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 admin-stagger">
          <button
            onClick={() => navigate("/admin/student-profile")}
            className="admin-card"
            style={{ animationDelay: '0ms' }}
          >
            <div className="admin-card-header">
              <span className="admin-card-icon">SP</span>
              <span className="admin-card-arrow">→</span>
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-1">StudentProfile</h3>
            <p className="text-slate-500 text-sm">
              Member 1 — Student Account + Profile Management
            </p>
            <p className="text-xs text-orange-600 mt-3 font-semibold">Click to Enter</p>
          </button>

          <button
            onClick={() => navigate("/admin/company")}
            className="admin-card"
            style={{ animationDelay: '80ms' }}
          >
            <div className="admin-card-header">
              <span className="admin-card-icon">CJ</span>
              <span className="admin-card-arrow">→</span>
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-1">CompanyJobs</h3>
            <p className="text-slate-500 text-sm">
              Member 2 — Company Dashboard + Job Posting + Interview Slots
            </p>
            <p className="text-xs text-orange-600 mt-3 font-semibold">Click to Enter</p>
          </button>

          <div className="admin-card" style={{ animationDelay: '160ms' }}>
            <div className="admin-card-header">
              <span className="admin-card-icon">JM</span>
              <span className="admin-card-chip">User portal</span>
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-1">JobMatch</h3>
            <p className="text-slate-500 text-sm">
              Member 3 — Job Search + Smart Matching + CV Generator
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/applications')}
            className="admin-card"
            style={{ animationDelay: '240ms' }}
          >
            <div className="admin-card-header">
              <span className="admin-card-icon">AP</span>
              <span className="admin-card-arrow">→</span>
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-1">Applications</h3>
            <p className="text-slate-500 text-sm">
              Member 4 — Applications + Interview Booking + Payment
            </p>
            <p className="text-xs text-orange-600 mt-3 font-semibold">Click to Enter</p>
          </button>
        </div>
      </section>

      <footer className="py-6 text-center text-slate-400 text-sm">
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
  return (
    <div>
      <StudentHome />

      <footer className="bg-gray-800 text-white py-6 text-center">
        <p>© 2026 CareerBridge — ITPM Group Project</p>
      </footer>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
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

  const shouldHideNavbar = location.pathname.startsWith("/admin");

  return (
    <>
      {!shouldHideNavbar && (
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
      )}
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