import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "student",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!formData.role) {
      newErrors.role = "Account type is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
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

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          role: formData.role,
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setMessage(
        data.message ||
          "Registration successful. Please check your email to verify your account."
      );

      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-5xl bg-white rounded-[24px] shadow-[0_14px_38px_rgba(30,58,138,0.10)] overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#E5E7EB]">
        <div className="hidden md:block relative min-h-[460px]">
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
            alt="Sign up visual"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/85 via-[#1E3A8A]/35 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center px-8">
            <div className="w-full max-w-[360px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white shadow-lg">
              <p className="text-sm text-blue-100 mb-3">Join CareerBridge</p>

              <h3 className="text-[28px] font-bold leading-tight">
                Create your account and get started
              </h3>

              <p className="text-sm text-blue-100 mt-4 leading-6">
                Sign up to discover opportunities, build your profile, and
                connect with the right companies.
              </p>

              <div className="flex justify-center gap-4 mt-6">
                <div className="bg-white/15 rounded-xl px-4 py-2 text-center min-w-[88px]">
                  <p className="text-xl font-bold">Easy</p>
                  <p className="text-xs text-blue-100 mt-1">Signup</p>
                </div>

                <div className="bg-white/15 rounded-xl px-4 py-2 text-center min-w-[88px]">
                  <p className="text-xl font-bold">Build</p>
                  <p className="text-xs text-blue-100 mt-1">Profile</p>
                </div>

                <div className="bg-white/15 rounded-xl px-4 py-2 text-center min-w-[88px]">
                  <p className="text-xl font-bold">Explore</p>
                  <p className="text-xs text-blue-100 mt-1">Careers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 md:px-8 flex flex-col justify-center">
          <div className="mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center shadow-md mb-3">
              <svg
                className="w-5 h-5 text-white"
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

            <h2 className="text-2xl font-bold text-[#111827]">Create Account</h2>
            <p className="text-[#6B7280] mt-1 text-sm">
              Join CareerBridge and get started today
            </p>
          </div>

          {message && (
            <div className="mb-3 rounded-xl bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 bg-[#F9FAFB] outline-none transition ${
                    errors.firstName
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 bg-[#F9FAFB] outline-none transition ${
                    errors.lastName
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 bg-[#F9FAFB] outline-none transition ${
                  errors.role
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                }`}
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-red-600">{errors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 bg-[#F9FAFB] outline-none transition ${
                  errors.email
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full rounded-xl border px-4 py-2.5 bg-[#F9FAFB] outline-none transition ${
                  errors.password
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="text-xs text-[#6B7280] mt-1">
                Use at least 8 characters.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full rounded-xl border px-4 py-2.5 bg-[#F9FAFB] outline-none transition ${
                  errors.confirmPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F59E0B] text-white py-2.5 rounded-xl font-semibold hover:bg-amber-500 transition disabled:opacity-60 shadow-md mt-2"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-5">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-[#1E3A8A] font-semibold hover:text-[#3B82F6] hover:underline"
            >
              Sign In
            </Link>
          </p>

          <div className="text-center mt-2">
            <Link
              to="/"
              className="text-sm text-[#6B7280] hover:text-[#1E3A8A]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;