import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "New password and confirm password do not match.";
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

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to change password.");
        return;
      }

      setMessage(data.message || "Password changed successfully.");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 1200);
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
            Change Password
          </h2>
          <p className="text-[#6B7280] mt-1 text-sm">
            Update your password securely
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
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 pr-16 bg-[#F9FAFB] outline-none transition ${
                  errors.currentPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#1E3A8A] hover:text-[#3B82F6]"
              >
                
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 pr-16 bg-[#F9FAFB] outline-none transition ${
                  errors.newPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#1E3A8A] hover:text-[#3B82F6]"
              >
                
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
            )}
            <p className="text-xs text-[#6B7280] mt-1">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 pr-16 bg-[#F9FAFB] outline-none transition ${
                  errors.confirmPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#1E3A8A] hover:text-[#3B82F6]"
              >
                
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F59E0B] text-white py-2.5 rounded-xl font-semibold hover:bg-amber-500 transition disabled:opacity-60 shadow-md"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-sm text-[#6B7280] hover:text-[#1E3A8A]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;