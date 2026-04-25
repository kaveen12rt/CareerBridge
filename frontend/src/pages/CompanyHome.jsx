import { Link, useNavigate } from "react-router-dom";

function CompanyHome({ currentUser }) {
  const navigate = useNavigate();
  const cp = currentUser?.companyProfile || {};
  const companyName = cp.companyName || "Your Company";
  const companyInitials = companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const isProfileComplete = !!currentUser?.profileCompleted;

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative min-h-[70vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-5xl px-6 text-center text-white">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center overflow-hidden shadow-xl">
            {cp.logo ? (
              <img
                src={cp.logo}
                alt={companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-extrabold">{companyInitials || "CB"}</span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mt-6">
            Welcome,{" "}
            <span className="text-orange-400">{companyName}</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-200 mt-5 max-w-4xl mx-auto">
            {cp.description
              ? cp.description
              : "Complete your company profile and start connecting with top student talent."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition"
            >
              View Company Profile →
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile/edit")}
              className="bg-white/20 backdrop-blur-sm border border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="mt-8">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                isProfileComplete
                  ? "bg-emerald-400/20 text-emerald-200 border border-emerald-300/30"
                  : "bg-amber-400/20 text-amber-200 border border-amber-300/30"
              }`}
            >
              {isProfileComplete ? "Profile completed" : "Profile incomplete — please complete it"}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">
              {cp.industry ? "1" : "0"}
            </h3>
            <p className="text-gray-600 mt-2">Industry set</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">
              {cp.location ? "1" : "0"}
            </h3>
            <p className="text-gray-600 mt-2">Location set</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">
              {cp.website ? "1" : "0"}
            </h3>
            <p className="text-gray-600 mt-2">Website set</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">
              {isProfileComplete ? "✓" : "!"}
            </h3>
            <p className="text-gray-600 mt-2">Profile status</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Get started as an employer
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            CareerBridge helps you present your company clearly, publish roles,
            and connect with students. Use the steps below to set up your company
            space.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="company-card bg-white rounded-2xl shadow-md border border-gray-200 p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
                Step 1
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                Complete your profile
              </h3>
              <p className="text-gray-600 mt-3 leading-7">
                Add your company name, industry, location, website, and a short
                description. Students use this to understand and trust your
                organization.
              </p>
              <button
                type="button"
                onClick={() => navigate("/profile/edit")}
                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition w-full"
              >
                Update company profile
              </button>
            </div>

            <div className="company-card bg-white rounded-2xl shadow-md border border-gray-200 p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
                Step 2
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                Publish opportunities
              </h3>
              <p className="text-gray-600 mt-3 leading-7">
                Post job openings and manage interview slots from the Company
                Jobs page. Use clear requirements and benefits to attract
                better matches.
              </p>
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition w-full"
              >
                Open Jobs
              </button>
            </div>

            <div className="company-card bg-blue-900 rounded-2xl shadow-md border border-blue-900 p-7 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-200">
                Profile summary
              </p>
              <h3 className="text-2xl font-bold mt-2">{companyName}</h3>
              <div className="mt-4 space-y-2 text-sm text-blue-100">
                <p>
                  Industry:{" "}
                  <span className="font-semibold text-white">
                    {cp.industry || "-"}
                  </span>
                </p>
                <p>
                  Location:{" "}
                  <span className="font-semibold text-white">
                    {cp.location || "-"}
                  </span>
                </p>
                <p className="break-all">
                  Website:{" "}
                  <span className="font-semibold text-white">
                    {cp.website || "-"}
                  </span>
                </p>
                <p>
                  Status:{" "}
                  <span className="font-semibold text-white">
                    {isProfileComplete ? "Completed" : "Incomplete"}
                  </span>
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-white/10 border border-white/15 p-4">
                <p className="text-sm text-blue-100">
                  Need help? Visit{" "}
                  <Link to="/contact" className="text-orange-200 font-semibold hover:underline">
                    Contact Us
                  </Link>{" "}
                  or read{" "}
                  <Link to="/feedback" className="text-orange-200 font-semibold hover:underline">
                    Feedback
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CompanyHome;

