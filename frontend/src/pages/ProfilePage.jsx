import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [savedCVs, setSavedCVs] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);

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

        setUser(data.data.user);

        // Load saved CVs
        if (data.data.user._id) {
          setLoadingCVs(true);
          try {
            const cvRes = await fetch(
              `http://localhost:5000/api/job-match/cv/${data.data.user._id}`,
              { credentials: "include" }
            );
            const cvData = await cvRes.json();
            if (cvData?.templates) {
              setSavedCVs(cvData.templates);
            }
          } catch (cvError) {
            console.error("Error loading saved CVs:", cvError);
          } finally {
            setLoadingCVs(false);
          }
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const deleteCV = async (cvId) => {
    if (!window.confirm("Are you sure you want to delete this CV?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/job-match/cv/template/${cvId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        setSavedCVs(savedCVs.filter((cv) => cv._id !== cvId));
      } else {
        alert("Failed to delete CV");
      }
    } catch (error) {
      console.error("Error deleting CV:", error);
      alert("Error deleting CV");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600 text-lg">{error || "Profile not found."}</p>
      </div>
    );
  }

  const sp = user.studentProfile || {};
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Top Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 h-36" />

          <div className="px-8 pb-8 -mt-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-indigo-600 shrink-0">
                  {initials}
                </div>

                <div className="flex flex-col justify-center pt-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                    {user.firstName} {user.lastName}
                  </h1>

                  <p className="text-gray-500 text-base mt-2 break-all">
                    {user.email}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                      Student Profile
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                      {user.profileCompleted ? "Profile Completed" : "Profile Incomplete"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md text-sm"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Education Details
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-sm text-gray-500 mb-1">University</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {sp.university || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-sm text-gray-500 mb-1">Major</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {sp.major || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Graduation Year</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {sp.graduationYear || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Bio</h2>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 min-h-[140px]">
                <p className="text-gray-700 leading-8">
                  {sp.bio || "No bio added yet."}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Resume</h2>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                {sp.resume ? (
                  <a
                    href={sp.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 hover:underline break-all font-medium"
                  >
                    {sp.resume}
                  </a>
                ) : (
                  <p className="text-gray-500">No resume link added yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Generated CVs</h2>
                <Link
                  to="/job-match/cv-generator"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                >
                  Create New
                </Link>
              </div>

              {loadingCVs ? (
                <p className="text-gray-500">Loading your CVs...</p>
              ) : savedCVs.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-center">
                  <p className="text-gray-500 mb-3">No CVs created yet.</p>
                  <Link
                    to="/job-match/cv-generator"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Create your first CV
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCVs.map((cv) => (
                    <div
                      key={cv._id}
                      className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{cv.name}</h3>
                        <p className="text-xs text-gray-500">
                          Saved on {new Date(cv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to="/job-match/cv-generator"
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-indigo-700 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteCV(cv._id)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Skills</h2>

              {sp.skills?.length ? (
                <div className="flex flex-wrap gap-3">
                  {sp.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills added yet.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Certifications
              </h2>

              {sp.certifications?.length ? (
                <div className="flex flex-wrap gap-3">
                  {sp.certifications.map((item, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No certifications added yet.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-5">Profile Summary</h2>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-indigo-100">Skills Count</p>
                  <p className="text-2xl font-bold">{sp.skills?.length || 0}</p>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-indigo-100">Certifications Count</p>
                  <p className="text-2xl font-bold">
                    {sp.certifications?.length || 0}
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-indigo-100">Profile Status</p>
                  <p className="text-lg font-bold">
                    {user.profileCompleted ? "Completed" : "Incomplete"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Keep your profile updated
            </h3>
            <p className="text-gray-500 mt-1">
              Add your latest skills, education, and certifications to make your profile stronger.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/profile/edit")}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm"
            >
              Edit Profile
            </button>

            <Link
              to="/"
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;