import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      setMessage(data.message || "Login successful.");

      setTimeout(() => {
        navigate(data.redirectUrl || "/");
      }, 600);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-[0_18px_50px_rgba(30,58,138,0.12)] overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#E5E7EB]">
        {/* Left Side - Form */}
        <div className="px-6 py-8 sm:px-8 md:px-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] flex items-center justify-center shadow-md mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c2.761 0 5-2.239 5-5S14.761 1 12 1 7 3.239 7 6s2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-[#111827]">Welcome Back</h2>
            <p className="text-[#6B7280] mt-2 text-sm">
              Sign in to continue to your account
            </p>
          </div>

          {message && (
            <div className="mb-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border px-4 py-3 bg-[#F9FAFB] outline-none transition ${
                    errors.email
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border px-4 py-3 pr-16 bg-[#F9FAFB] outline-none transition ${
                    errors.password
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#1E3A8A] hover:text-[#3B82F6]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}

              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#1E3A8A] hover:text-[#3B82F6] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F59E0B] text-white py-3 rounded-2xl font-semibold hover:bg-amber-500 transition disabled:opacity-60 shadow-md"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-[#1E3A8A] font-semibold hover:text-[#3B82F6] hover:underline"
            >
              Sign Up
            </Link>
          </p>

          <div className="text-center mt-3">
            <Link
              to="/"
              className="text-sm text-[#6B7280] hover:text-[#1E3A8A]"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Right Side - Photo */}
        <div className="hidden md:block relative min-h-[560px]">
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bG9nZ2luJTIwc2lnbiUyMGluJTIwZmVtYWxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
            alt="Sign in visual"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/85 via-[#1E3A8A]/35 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
              <p className="text-sm text-blue-100 mb-2">CareerBridge Portal</p>
              <h3 className="text-2xl font-bold leading-snug">
                Build your future with smart opportunities
              </h3>
              <p className="text-sm text-blue-100 mt-3 leading-6">
                Discover jobs, connect with employers, and manage your career
                journey in one place.
              </p>

              <div className="flex gap-3 mt-5">
                <div className="bg-white/15 rounded-2xl px-4 py-3 text-center">
                  <p className="text-lg font-bold">Easy</p>
                  <p className="text-xs text-blue-100">Access</p>
                </div>
                <div className="bg-white/15 rounded-2xl px-4 py-3 text-center">
                  <p className="text-lg font-bold">Fast</p>
                  <p className="text-xs text-blue-100">Login</p>
                </div>
                <div className="bg-white/15 rounded-2xl px-4 py-3 text-center">
                  <p className="text-lg font-bold">Safe</p>
                  <p className="text-xs text-blue-100">Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;