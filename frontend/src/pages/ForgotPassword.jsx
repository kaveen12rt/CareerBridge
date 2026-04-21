import { useState } from "react";
import { Link } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Please enter your email.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send reset email.");
        return;
      }

      setMessage(
        data.message ||
          "If the email exists, a password reset link has been sent."
      );
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_14px_38px_rgba(30,58,138,0.10)] border border-[#E5E7EB] px-6 py-7 sm:px-8">
        <div className="mb-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center shadow-md mx-auto mb-3">
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
                d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V9a5 5 0 1 0-10 0v2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#111827]">
            Forgot Password
          </h2>
          <p className="text-[#6B7280] mt-1 text-sm">
            Enter your email to receive a reset link
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-2.5 bg-[#F9FAFB] outline-none transition ${
                emailError
                  ? "border-red-400 focus:ring-2 focus:ring-red-200"
                  : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
              }`}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600">{emailError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F59E0B] text-white py-2.5 rounded-xl font-semibold hover:bg-amber-500 transition disabled:opacity-60 shadow-md"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link
            to="/signin"
            className="text-sm text-[#6B7280] hover:text-[#1E3A8A]"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;