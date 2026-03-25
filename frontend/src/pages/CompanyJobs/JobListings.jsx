import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const JobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = ['all', ...new Set(jobs.map(job => job.department))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Available Job Opportunities</h1>
          <p className="text-lg text-indigo-100 mb-8">
            Browse through our latest job postings and find your perfect match
          </p>

          {/* Search Section */}
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search by job title, department, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                {departments.filter(d => d !== 'all').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Job Cards */}
        {!loading && filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    {/* Job Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    
                    {/* Job Meta Info */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BriefcaseIcon className="h-5 w-5 mr-2" />
                        <span className="capitalize">{job.type}</span>
                      </div>
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center text-green-600 font-semibold">
                          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                          <span>
                            {job.salaryMin && job.salaryMax
                              ? `LKR ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                              : job.salaryMin
                              ? `From LKR ${job.salaryMin.toLocaleString()}`
                              : `Up to LKR ${job.salaryMax.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Job Description */}
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    {/* Requirements */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Posted Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col gap-2">
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap">
                      Apply Now
                    </button>
                    <button 
                      onClick={() => navigate(`/job-details/${job._id}`)}
                      className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new opportunities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;
