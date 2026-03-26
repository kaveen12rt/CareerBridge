import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ApplicationPage from "./pages/ApplicationManagement/ApplicationPage";
import InterviewBookingPage from "./pages/ApplicationManagement/InterviewBookingPage";
import PaymentPage from "./pages/ApplicationManagement/PaymentPage";

function Home() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => { setApiStatus(data.message); setLoading(false); })
      .catch(() => { setApiStatus("Backend not reachable"); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-20 px-4">
      <h2 className="text-5xl font-extrabold text-gray-800 mb-4 text-center">
        Welcome to <span className="text-indigo-600">CareerBridge</span>
      </h2>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-xl">
        Connecting students with companies. Search jobs, apply, book interviews, and launch your career.
      </p>
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Backend Status</h3>
        {loading ? (
          <p className="text-yellow-500 font-medium">Connecting...</p>
        ) : (
          <p className={`text-lg font-bold ${apiStatus === "CareerBridge API is running" ? "text-green-500" : "text-red-500"}`}>{apiStatus}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl w-full">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold text-blue-600 mb-1">StudentProfile</h3>
          <p className="text-gray-500 text-sm">Member 1 - Student Account + Profile Management</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
          <h3 className="text-lg font-bold text-indigo-600 mb-1">CompanyJobs</h3>
          <p className="text-gray-500 text-sm">Member 2 - Company Dashboard + Job Posting</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-bold text-purple-600 mb-1">JobMatch</h3>
          <p className="text-gray-500 text-sm">Member 3 - Smart Matching + CV Generator</p>
        </div>
        <Link to="/applications" className="bg-white rounded-xl shadow p-6 border-l-4 border-pink-500 hover:shadow-md transition cursor-pointer">
          <h3 className="text-lg font-bold text-pink-600 mb-1">Applications ↗</h3>
          <p className="text-gray-500 text-sm">Member 4 - Applications + Booking + Payment</p>
        </Link>
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold text-indigo-600">CareerBridge</Link>
      <div className="flex gap-6">
        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Home</Link>
        <Link to="/applications" className="text-gray-600 hover:text-pink-600 font-medium">Applications</Link>
        <Link to="/interviews" className="text-gray-600 hover:text-indigo-600 font-medium">Interviews</Link>
        <Link to="/payments" className="text-gray-600 hover:text-green-600 font-medium">Payments</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/applications" element={<ApplicationPage />} />
          <Route path="/interviews" element={<InterviewBookingPage />} />
          <Route path="/payments" element={<PaymentPage />} />
        </Routes>
        <footer className="mt-20 py-6 text-center text-gray-400 text-sm">
          © 2026 CareerBridge - All rights reserved.
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
