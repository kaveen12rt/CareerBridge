import { useState, useEffect } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-2xl font-bold text-indigo-600">CareerBridge</h1>
        <div className="flex gap-4">
          <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">Home</span>
          <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">Jobs</span>
          <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">Companies</span>
          <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">Applications</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center mt-20 px-4">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-4 text-center">
          Welcome to <span className="text-indigo-600">CareerBridge</span>
        </h2>
        <p className="text-lg text-gray-500 mb-8 text-center max-w-xl">
          Connecting students with companies. Search jobs, apply, book interviews, and launch your career.
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
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-blue-600 mb-1">StudentProfile</h3>
            <p className="text-gray-500 text-sm">Member 1 — Student Account + Profile Management</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
            <h3 className="text-lg font-bold text-indigo-600 mb-1">CompanyJobs</h3>
            <p className="text-gray-500 text-sm">Member 2 — Company Dashboard + Job Posting + Interview Slots</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-bold text-purple-600 mb-1">JobMatch</h3>
            <p className="text-gray-500 text-sm">Member 3 — Job Search + Smart Matching + CV Generator</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-pink-500">
            <h3 className="text-lg font-bold text-pink-600 mb-1">Applications</h3>
            <p className="text-gray-500 text-sm">Member 4 — Applications + Interview Booking + Payment</p>
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

export default App;
