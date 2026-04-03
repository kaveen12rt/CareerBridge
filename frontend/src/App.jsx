import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import logo from "./assets/logo1.png";

import CompanyJobsMain from "./pages/CompanyJobs/CompanyJobsMain";
import JobDetails from "./pages/CompanyJobs/JobDetails";
import StudentHome from "./pages/StudentProfile/StudentHome";
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
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="CareerBridge Logo"
            className="h-12 w-auto object-contain"
          />
          <span className="text-2xl font-bold text-indigo-600">
            Admin Portal
          </span>
        </Link>

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
            onClick={() => navigate("/admin/applications")}
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

  return (
    <div className="flex items-center gap-4 relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 hover:bg-white/10 rounded-xl px-3 py-2 transition"
      >
        <span className="hidden md:block font-semibold text-white">
          {fullName}
        </span>

        <span className="text-white text-sm">{open ? "▴" : "▾"}</span>

        <div className="w-11 h-11 rounded-full bg-white text-blue-800 flex items-center justify-center text-base font-bold">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-16 w-72 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden">
          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition"
          >
            Profile
          </button>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/change-password");
            }}
            className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition"
          >
            Change Password
          </button>

          <div className="border-t border-gray-200" />

          <button
            onClick={async () => {
              setOpen(false);
              await onLogout();
            }}
            className="w-full text-left px-5 py-4 text-red-600 hover:bg-red-50 transition"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function MainFooter() {
  return (
    <footer className="bg-blue-950 text-white mt-0">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <img
              src={logo}
              alt="CareerBridge Logo"
              className="h-16 w-auto object-contain mb-4 bg-white rounded-lg p-2"
            />
            <p className="text-blue-100 leading-7 max-w-md">
              CareerBridge connects students with top employers and helps them
              explore opportunities through job search, smart matching, and CV
              building tools.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3 text-blue-100">
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>
              <Link to="/jobs" className="hover:text-white transition">
                Jobs
              </Link>
              <Link to="/smart-matching" className="hover:text-white transition">
                Smart Matching
              </Link>
              <Link to="/cv-generator" className="hover:text-white transition">
                CV Generator
              </Link>
              <Link to="/feedback" className="hover:text-white transition">
                Feedback
              </Link>
              <Link to="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Contact Info
            </h3>
            <div className="space-y-3 text-blue-100">
              <p>Email: support@careerbridge.com</p>
              <p>Phone: +94 77 123 4567</p>
              <p>Address: Colombo, Sri Lanka</p>
              <p>Available: Monday - Friday</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-blue-200">
            © 2026 CareerBridge — Connecting Talent to Opportunity
          </p>

          <div className="flex gap-6 text-sm text-blue-200">
            <Link to="/feedback" className="hover:text-white transition">
              Feedback
            </Link>
            <Link to="/contact" className="hover:text-white transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function UserPortal({ currentUser, checkingAuth, handleLogout }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-[#1f3a8a] px-8 py-4 flex items-center justify-between shadow-md border-b border-blue-700">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="CareerBridge Logo"
            className="h-16 w-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-white font-medium hover:text-orange-300">
            Home
          </Link>
          <Link
            to="/jobs"
            className="text-white font-medium hover:text-orange-300"
          >
            Jobs
          </Link>
          <Link
            to="/smart-matching"
            className="text-white font-medium hover:text-orange-300"
          >
            Smart Matching
          </Link>
          <Link
            to="/cv-generator"
            className="text-white font-medium hover:text-orange-300"
          >
            CV Generator
          </Link>

          {currentUser && (
            <Link
              to="/my-applications"
              className="text-white font-medium hover:text-orange-300"
            >
              My Applications
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {checkingAuth ? (
            <span className="text-white">Loading...</span>
          ) : currentUser ? (
            <UserMenu currentUser={currentUser} onLogout={handleLogout} />
          ) : (
            <>
              <Link
                to="/signin"
                className="text-white font-medium hover:text-orange-300"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex-1">
        <StudentHome currentUser={currentUser} />
      </div>

      <MainFooter />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const hideChatbotRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/change-password",
    "/admin",
    "/admin/company",
    "/admin/student-profile",
    "/admin/applications",
  ];

  const publicAuthRoutes = ["/signin", "/signup", "/forgot-password"];

  const shouldHideChatbot =
    hideChatbotRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  useEffect(() => {
    const skipAuthCheck =
      publicAuthRoutes.includes(location.pathname) ||
      location.pathname.startsWith("/reset-password/") ||
      location.pathname.startsWith("/admin");

    if (skipAuthCheck) {
      setCheckingAuth(false);
      return;
    }

    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/check-auth", {
          credentials: "include",
        });

        if (!isMounted) return;

        if (res.status === 401) {
          setCurrentUser(null);
          return;
        }

        const data = await res.json();

        if (res.ok && data?.data?.user) {
          setCurrentUser(data.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Auth check failed:", error);
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    setCheckingAuth(true);
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

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
    <>
      <Routes>
        <Route
          path="/"
          element={
            <UserPortal
              currentUser={currentUser}
              checkingAuth={checkingAuth}
              handleLogout={handleLogout}
            />
          }
        />
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