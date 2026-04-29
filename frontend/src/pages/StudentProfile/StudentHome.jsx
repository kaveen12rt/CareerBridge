import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudentHome = ({ currentUser }) => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(
          Array.isArray(data)
            ? data.filter((job) => job.status === "active")
            : []
        );
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const title = job?.title || "";
    const companyName = job?.companyName || "";
    const department = job?.department || "";
    const location = job?.location || "";

    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative min-h-[78vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/55"></div>

        <div className="relative z-10 max-w-4xl px-6 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Bridge Your Career to <br />
            <span className="text-orange-400">Success</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
            Connect with top employers, build your professional profile, and
            accelerate your career journey with AI-powered job matching.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!currentUser ? (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition"
                >
                  Get Started Now →
                </button>

                <button
                  onClick={() => navigate("/jobs")}
                  className="bg-white/20 backdrop-blur-sm border border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition"
                >
                  Browse Jobs
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/jobs")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition"
                >
                  Browse Jobs
                </button>

                <button
                  onClick={() => navigate("/smart-matching")}
                  className="bg-white/20 backdrop-blur-sm border border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition"
                >
                  Smart Matching
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">10,000+</h3>
            <p className="text-gray-600 mt-2">Students</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">500+</h3>
            <p className="text-gray-600 mt-2">Top Employers</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">95%</h3>
            <p className="text-gray-600 mt-2">Success Rate</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-blue-900">50,000+</h3>
            <p className="text-gray-600 mt-2">Job Opportunities</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Search Career Opportunities
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Search jobs by title, company, department, or location.
          </p>

          <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3">
            <input
              type="text"
              className="flex-1 px-5 py-4 text-gray-800 text-lg outline-none rounded-xl border border-gray-200"
              placeholder="Search by job title, company, department, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => navigate("/jobs")}
              className="bg-blue-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-800 transition"
            >
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {searchTerm ? "Search Results" : "Featured Jobs"}
          </h3>

          {loading ? (
            <div className="text-center py-12 text-gray-600 text-lg">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-lg">
              {searchTerm
                ? "No jobs found matching your search"
                : "No jobs available at the moment"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.slice(0, 6).map((job) => {
                const salaryMin =
                  typeof job?.salaryMin === "number"
                    ? job.salaryMin.toLocaleString()
                    : "N/A";

                const salaryMax =
                  typeof job?.salaryMax === "number"
                    ? job.salaryMax.toLocaleString()
                    : "N/A";

                const skills = Array.isArray(job?.skills) ? job.skills : [];

                return (
                  <div
                    key={job._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
                  >
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <h4 className="text-xl font-bold text-gray-800">
                        {job?.title || "Untitled Job"}
                      </h4>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        {job?.type || "N/A"}
                      </span>
                    </div>

                    <p className="text-gray-700 font-semibold mb-1">
                      {job?.companyName || "N/A"}
                    </p>

                    <p className="text-gray-500 mb-1">
                      {job?.department || "N/A"}
                    </p>

                    <p className="text-gray-500 mb-3">
                      📍 {job?.location || "N/A"}
                    </p>

                    <p className="text-gray-800 font-semibold mb-4">
                      💰 Rs. {salaryMin} - Rs. {salaryMax}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {skills.length > 0 ? (
                        skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm">
                          No skills listed
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          currentUser ? navigate("/jobs") : navigate("/signin")
                        }
                        className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Apply Now
                      </button>

                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="flex-1 bg-white text-blue-900 border-2 border-blue-900 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentHome;