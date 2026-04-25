import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EditProfilePage({ onUserUpdated }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [role, setRole] = useState("student");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    industry: "",
    website: "",
    description: "",
    location: "",
    employeeCount: "",
    logo: "",
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
        setRole(user.role || "student");

        const sp = user.studentProfile || {};
        const cp = user.companyProfile || {};

        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          companyName: cp.companyName || "",
          industry: cp.industry || "",
          website: cp.website || "",
          description: cp.description || "",
          location: cp.location || "",
          employeeCount: cp.employeeCount || "",
          logo: cp.logo || "",
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

    if (role === "company") {
      if (!formData.companyName.trim())
        errors.companyName = "Company name is required.";
      if (!formData.industry.trim()) errors.industry = "Industry is required.";
      if (!formData.description.trim())
        errors.description = "Company description is required.";
    } else {
      if (!formData.university.trim())
        errors.university = "University is required.";
      if (!formData.major.trim()) errors.major = "Major is required.";

      if (
        formData.graduationYear &&
        !/^\d{4}$/.test(String(formData.graduationYear))
      ) {
        errors.graduationYear = "Graduation year must be 4 digits.";
      }
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
      };

      if (role === "company") {
        body.companyProfile = {
          companyName: formData.companyName.trim(),
          industry: formData.industry.trim(),
          website: formData.website.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          employeeCount: formData.employeeCount.trim(),
          logo: formData.logo.trim(),
        };
      } else {
        body.studentProfile = {
          university: formData.university.trim(),
          major: formData.major.trim(),
          graduationYear: formData.graduationYear
            ? Number(formData.graduationYear)
            : undefined,
          skills: toArray(formData.skillsText),
          certifications: toArray(formData.certificationsText),
          bio: formData.bio.trim(),
          resume: formData.resume.trim(),
        };
      }

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
      if (typeof onUserUpdated === "function" && data?.data?.user) {
        onUserUpdated(data.data.user);
      }

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
            {role === "company" ? "Edit Company Profile" : "Edit Profile"}
          </h1>
          <p className="text-gray-600 text-lg">
            {role === "company"
              ? "Enter or update your company profile details here."
              : "Enter or update your student profile details here."}
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

            {role === "company" ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.companyName && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.companyName}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {formErrors.industry && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.industry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Employee Count
                    </label>
                    <input
                      type="text"
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleChange}
                      placeholder="e.g., 1-10, 11-50, 51-200"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Company Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Logo URL (optional)
                  </label>
                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            ) : (
              <>
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
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.university}
                      </p>
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
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.major}
                      </p>
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
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.graduationYear}
                    </p>
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
              </>
            )}

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