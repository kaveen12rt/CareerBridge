import { useState, useEffect } from 'react';

const StudentHome = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.filter(job => job.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-4 text-center">Find Your Dream Job</h2>
          <p className="text-xl text-center mb-10 text-purple-100">
            Connect with top companies and launch your career with CareerBridge
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex gap-4 bg-white p-2 rounded-xl shadow-2xl">
              <input
                type="text"
                className="flex-1 px-6 py-4 text-gray-800 text-lg outline-none rounded-lg"
                placeholder="Search by job title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Stats */}
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

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Popular Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-8 rounded-xl text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-indigo-500">
              <div className="text-5xl mb-4">💻</div>
              <h4 className="text-xl font-semibold mb-2">IT & Technology</h4>
              <p className="text-gray-600">250+ jobs</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-indigo-500">
              <div className="text-5xl mb-4">📈</div>
              <h4 className="text-xl font-semibold mb-2">Business</h4>
              <p className="text-gray-600">180+ jobs</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-indigo-500">
              <div className="text-5xl mb-4">🎨</div>
              <h4 className="text-xl font-semibold mb-2">Design</h4>
              <p className="text-gray-600">120+ jobs</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-indigo-500">
              <div className="text-5xl mb-4">🔬</div>
              <h4 className="text-xl font-semibold mb-2">Engineering</h4>
              <p className="text-gray-600">200+ jobs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {searchTerm ? 'Search Results' : 'Featured Jobs'}
          </h3>
          
          {loading ? (
            <div className="text-center py-12 text-gray-600 text-lg">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-lg">
              {searchTerm ? 'No jobs found matching your search' : 'No jobs available at the moment'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border-2 border-transparent hover:border-indigo-500">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-bold text-gray-800">{job.title}</h4>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">{job.department}</p>
                  <p className="text-gray-500 mb-2">📍 {job.location}</p>
                  <p className="text-gray-700 font-semibold mb-4">
                    💰 Rs. {job.salaryMin.toLocaleString()} - Rs. {job.salaryMax.toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    ))}
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
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentHome;
