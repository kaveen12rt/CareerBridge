import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

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
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <p className="text-slate-700 text-lg font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium">
          {error || "Profile not found."}
        </p>
      </div>
    );
  }

  const sp = user.studentProfile || {};
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 px-4 py-8 md:py-10">
      <div className="max-w-6xl mx-auto">
        {/* Top Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100 mb-8">
          <div className="h-32 md:h-36 bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600" />

          <div className="px-6 md:px-8 pb-8 -mt-14">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-2xl md:text-3xl font-bold text-blue-900 shrink-0">
                  {initials}
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Student Profile
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.profileCompleted
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {user.profileCompleted
                        ? "Profile Completed"
                        : "Profile Incomplete"}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                    {user.firstName} {user.lastName}
                  </h1>

                  <p className="text-slate-500 mt-2 break-all">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
                >
                  Edit Profile
                </button>

                <Link
                  to="/"
                  className="bg-white border border-blue-200 text-blue-900 px-5 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-blue-950 mb-4">
                Education Details
              </h2>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">University</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {sp.university || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">Major</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {sp.major || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 md:col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Graduation Year</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {sp.graduationYear || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-blue-950 mb-4">Bio</h2>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[110px]">
                <p className="text-slate-700 leading-7">
                  {sp.bio || "No bio added yet."}
                </p>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-blue-950 mb-4">Resume</h2>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                {sp.resume ? (
                  <a
                    href={sp.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:text-orange-500 hover:underline break-all font-semibold"
                  >
                    {sp.resume}
                  </a>
                ) : (
                  <p className="text-slate-500">No resume link added yet.</p>
                )}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-blue-950">
                  Keep your profile updated
                </h3>
                <p className="text-slate-500 mt-1">
                  Add your latest skills, education, and certifications to make
                  your profile stronger.
                </p>
              </div>

              <button
                onClick={() => navigate("/profile/edit")}
                className="bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-5">Profile Summary</h2>

              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-blue-100">Skills Count</p>
                  <p className="text-2xl font-bold">{sp.skills?.length || 0}</p>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-blue-100">Certifications Count</p>
                  <p className="text-2xl font-bold">
                    {sp.certifications?.length || 0}
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-blue-100">Status</p>
                  <p className="text-lg font-bold">
                    {user.profileCompleted ? "Completed" : "Incomplete"}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-blue-950 mb-4">Skills</h2>

              {sp.skills?.length ? (
                <div className="flex flex-wrap gap-3">
                  {sp.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No skills added yet.</p>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-blue-950 mb-4">
                Certifications
              </h2>

              {sp.certifications?.length ? (
                <div className="flex flex-wrap gap-3">
                  {sp.certifications.map((item, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No certifications added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;