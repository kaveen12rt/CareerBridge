import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function StudentProfileDashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
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

  const toArray = (text) =>
    text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:5000/api/auth/users?role=student&limit=100",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load student profiles.");
        return;
      }

      setStudents(data?.data?.users || []);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const stats = useMemo(() => {
    const total = students.length;
    const withEducation = students.filter(
      (s) => s.studentProfile?.university || s.studentProfile?.major
    ).length;
    const withCertifications = students.filter(
      (s) => s.studentProfile?.certifications?.length > 0
    ).length;

    return { total, withEducation, withCertifications };
  }, [students]);

  const startEdit = (student) => {
    const sp = student.studentProfile || {};

    setEditingId(student._id);
    setError("");
    setSuccess("");

    setEditForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
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
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
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
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (userId) => {
    try {
      setError("");
      setSuccess("");

      const res = await fetch(
        `http://localhost:5000/api/auth/users/${userId}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            firstName: editForm.firstName.trim(),
            lastName: editForm.lastName.trim(),
            email: editForm.email.trim(),
            studentProfile: {
              university: editForm.university.trim(),
              major: editForm.major.trim(),
              graduationYear: editForm.graduationYear
                ? Number(editForm.graduationYear)
                : undefined,
              skills: toArray(editForm.skillsText),
              certifications: toArray(editForm.certificationsText),
              bio: editForm.bio.trim(),
              resume: editForm.resume.trim(),
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update student profile.");
        return;
      }

      setSuccess("Student profile updated successfully.");
      setEditingId(null);
      fetchStudents();
    } catch {
      setError("Server error. Please try again.");
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student's profile data?"
    );
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const res = await fetch(
        `http://localhost:5000/api/auth/users/${userId}/profile`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to delete student profile.");
        return;
      }

      setSuccess("Student profile deleted successfully.");
      fetchStudents();
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">
            Student Profile Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            View, update, and delete student data submitted from the user
            portal.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-100 text-green-700 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-gray-600">
            Loading student profiles...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-blue-600 mb-2">
                  Total Students
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Registered student accounts
                </p>
              </div>

              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
                <h3 className="text-lg font-bold text-indigo-600 mb-2">
                  Education Added
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.withEducation}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Profiles with university and major
                </p>
              </div>

              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
                <h3 className="text-lg font-bold text-purple-600 mb-2">
                  Certifications Added
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.withCertifications}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Profiles with certifications
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {students.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-gray-600">
                  No student profiles found.
                </div>
              ) : (
                students.map((student) => {
                  const sp = student.studentProfile || {};
                  const isEditing = editingId === student._id;

                  return (
                    <div
                      key={student._id}
                      className="bg-white rounded-2xl shadow-lg p-8"
                    >
                      {!isEditing ? (
                        <>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                              <h2 className="text-2xl font-bold text-slate-800">
                                {student.firstName} {student.lastName}
                              </h2>
                              <p className="text-gray-500">{student.email}</p>
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => startEdit(student)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                              >
                                Update
                              </button>

                              <button
                                onClick={() => handleDelete(student._id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="border rounded-xl p-4">
                              <p className="text-sm text-gray-500 mb-1">
                                University
                              </p>
                              <p className="font-semibold text-slate-800">
                                {sp.university || "-"}
                              </p>
                            </div>

                            <div className="border rounded-xl p-4">
                              <p className="text-sm text-gray-500 mb-1">
                                Major
                              </p>
                              <p className="font-semibold text-slate-800">
                                {sp.major || "-"}
                              </p>
                            </div>

                            <div className="border rounded-xl p-4">
                              <p className="text-sm text-gray-500 mb-1">
                                Graduation Year
                              </p>
                              <p className="font-semibold text-slate-800">
                                {sp.graduationYear || "-"}
                              </p>
                            </div>
                          </div>

                          <div className="grid lg:grid-cols-2 gap-6">
                            <div className="border rounded-2xl p-5">
                              <h3 className="text-lg font-bold text-slate-800 mb-3">
                                Skills
                              </h3>
                              {sp.skills?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {sp.skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500">
                                  No skills added.
                                </p>
                              )}
                            </div>

                            <div className="border rounded-2xl p-5">
                              <h3 className="text-lg font-bold text-slate-800 mb-3">
                                Certifications
                              </h3>
                              {sp.certifications?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {sp.certifications.map((item, index) => (
                                    <span
                                      key={index}
                                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500">
                                  No certifications added.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid lg:grid-cols-2 gap-6 mt-6">
                            <div className="border rounded-2xl p-5">
                              <h3 className="text-lg font-bold text-slate-800 mb-3">
                                Bio
                              </h3>
                              <p className="text-gray-700 leading-7">
                                {sp.bio || "No bio added."}
                              </p>
                            </div>

                            <div className="border rounded-2xl p-5">
                              <h3 className="text-lg font-bold text-slate-800 mb-3">
                                Resume Link
                              </h3>
                              {sp.resume ? (
                                <a
                                  href={sp.resume}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:underline break-all"
                                >
                                  {sp.resume}
                                </a>
                              ) : (
                                <p className="text-gray-500">
                                  No resume link added.
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-slate-800">
                            Update Student Profile
                          </h2>

                          <div className="grid md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="firstName"
                              placeholder="First name"
                              value={editForm.firstName}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                            />

                            <input
                              type="text"
                              name="lastName"
                              placeholder="Last name"
                              value={editForm.lastName}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                            />
                          </div>

                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="university"
                              placeholder="University"
                              value={editForm.university}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                            />

                            <input
                              type="text"
                              name="major"
                              placeholder="Major"
                              value={editForm.major}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                            />
                          </div>

                          <input
                            type="number"
                            name="graduationYear"
                            placeholder="Graduation year"
                            value={editForm.graduationYear}
                            onChange={handleEditChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                          />

                          <input
                            type="text"
                            name="skillsText"
                            placeholder="Skills separated by commas"
                            value={editForm.skillsText}
                            onChange={handleEditChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                          />

                          <input
                            type="text"
                            name="certificationsText"
                            placeholder="Certifications separated by commas"
                            value={editForm.certificationsText}
                            onChange={handleEditChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                          />

                          <textarea
                            name="bio"
                            placeholder="Bio"
                            value={editForm.bio}
                            onChange={handleEditChange}
                            rows="4"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                          />

                          <input
                            type="text"
                            name="resume"
                            placeholder="Resume link"
                            value={editForm.resume}
                            onChange={handleEditChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                          />

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUpdate(student._id)}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                              Save Update
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        <Link
          to="/admin"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}

export default StudentProfileDashboard;