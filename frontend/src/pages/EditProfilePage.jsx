import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EditProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    major: "",
    graduationYear: "",
    skillsText: "",
    certificationsText: "",
    bio: "",
    resume: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data?.data?.user) {
          navigate("/signin");
          return;
        }

        const user = data.data.user;
        const sp = user.studentProfile || {};

        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          university: sp.university || "",
          major: sp.major || "",
          graduationYear: sp.graduationYear || "",
          skillsText: Array.isArray(sp.skills) ? sp.skills.join(", ") : "",
          certificationsText: Array.isArray(sp.certifications)
            ? sp.certifications.join(", ")
            : "",
          bio: sp.bio || "",
          resume: sp.resume || "",
        });
      } catch {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const toArray = (text) =>
    text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const validate = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Enter a valid email.";
    }

    if (!formData.university.trim()) errors.university = "University is required.";
    if (!formData.major.trim()) errors.major = "Major is required.";

    if (
      formData.graduationYear &&
      !/^\d{4}$/.test(String(formData.graduationYear))
    ) {
      errors.graduationYear = "Graduation year must be 4 digits.";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccess("");
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setSaving(true);

      const body = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        studentProfile: {
          university: formData.university.trim(),
          major: formData.major.trim(),
          graduationYear: formData.graduationYear
            ? Number(formData.graduationYear)
            : undefined,
          skills: toArray(formData.skillsText),
          certifications: toArray(formData.certificationsText),
          bio: formData.bio.trim(),
          resume: formData.resume.trim(),
        },
      };

      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save profile.");
        return;
      }

      setSuccess("Profile saved successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 800);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading edit form...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-3">
            Edit Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Enter or update your student profile details here.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  University
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.university && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.university}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Major
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.major && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.major}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.graduationYear && (
                <p className="mt-1 text-sm text-red-600">{formErrors.graduationYear}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Skills
              </label>
              <input
                type="text"
                name="skillsText"
                value={formData.skillsText}
                onChange={handleChange}
                placeholder="React, Java, Node.js"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Certifications
              </label>
              <input
                type="text"
                name="certificationsText"
                value={formData.certificationsText}
                onChange={handleChange}
                placeholder="AWS Cloud Practitioner, Google UX"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Resume Link
              </label>
              <input
                type="text"
                name="resume"
                value={formData.resume}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <Link
          to="/profile"
          className="inline-block mt-6 bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          Back to Profile
        </Link>
      </div>
    </div>
  );
}

export default EditProfilePage;