import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
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
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-4 text-center">
            Find Your Dream Job
          </h2>
          <p className="text-xl text-center mb-10 text-purple-100">
            Connect with top companies and launch your career with CareerBridge
          </p>

          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex gap-4 bg-white p-2 rounded-xl shadow-2xl">
              <input
                type="text"
                className="flex-1 px-6 py-4 text-gray-800 text-lg outline-none rounded-lg"
                placeholder="Search by job title, company, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-16 text-center">
            <div>
              <div className="text-4xl font-bold">{jobs.length}</div>
              <div className="text-purple-200 mt-1">Active Jobs</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50+</div>
              <div className="text-purple-200 mt-1">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-purple-200 mt-1">Success Stories</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Career Tools
          </h3>
          <p className="text-center text-gray-600 mb-12">
            Use these tools in order to search jobs, find your best match, and
            build your CV.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate("/jobs")}
              className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500 text-left hover:shadow-lg hover:bg-indigo-50 transition-all"
            >
              <h2 className="text-xl font-bold text-indigo-700">Job Search</h2>
              <p className="text-sm text-gray-600 mt-2">
                Search and view active jobs with filtering.
              </p>
            </button>

            <button
              onClick={() => navigate("/smart-matching")}
              className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 text-left hover:shadow-lg hover:bg-purple-50 transition-all"
            >
              <h2 className="text-xl font-bold text-purple-700">
                Smart Matching
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Rank jobs based on your preferred skills.
              </p>
            </button>

            <button
              onClick={() => navigate("/cv-generator")}
              className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500 text-left hover:shadow-lg hover:bg-emerald-50 transition-all"
            >
              <h2 className="text-xl font-bold text-emerald-700">
                CV Generator
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Build and preview your CV quickly.
              </p>
            </button>
          </div>
        </div>
      </section>

      <section className="py-16">
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
              {filteredJobs.map((job) => {
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
                    className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border-2 border-transparent hover:border-indigo-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-gray-800">
                        {job?.title || "Untitled Job"}
                      </h4>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {job?.type || "N/A"}
                      </span>
                    </div>

                    <p className="text-gray-600 font-medium mb-2">
                      {job?.companyName || "N/A"}
                    </p>

                    <p className="text-gray-600 font-medium mb-2">
                      {job?.department || "N/A"}
                    </p>

                    <p className="text-gray-500 mb-2">
                      📍 {job?.location || "N/A"}
                    </p>

                    <p className="text-gray-700 font-semibold mb-4">
                      💰 Rs. {salaryMin} - Rs. {salaryMax}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
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

                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                        Apply Now
                      </button>
                      <button className="flex-1 bg-white text-indigo-600 border-2 border-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
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