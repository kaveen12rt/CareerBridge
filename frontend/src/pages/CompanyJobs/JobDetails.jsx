import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    // TODO: Implement application logic
    alert('Application feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <button
            onClick={() => navigate('/job-listings')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/job-listings')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-6">
                {job.image && (
                  <img
                    src={job.image}
                    alt={job.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-5 w-5 mr-1" />
                      <span className="capitalize">{job.type}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    {job.experience && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 mr-1" />
                        <span>{job.experience}</span>
                      </div>
                    )}
                  </div>

                  {job.department && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {job.department}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <ul className="space-y-3">
                  {job.skills.map((skill, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              {/* Salary */}
              {(job.salaryMin || job.salaryMax) && (
                <div className="mb-6">
                  <div className="flex items-center text-green-600 mb-2">
                    <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                    <h3 className="font-bold text-lg">Salary Range</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {job.salaryMin && job.salaryMax
                      ? `LKR ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                      : job.salaryMin
                      ? `From LKR ${job.salaryMin.toLocaleString()}`
                      : `Up to LKR ${job.salaryMax.toLocaleString()}`}
                  </p>
                </div>
              )}

              {/* Deadline */}
              {job.deadline && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center text-gray-600 mb-2">
                    <CalendarIcon className="h-6 w-6 mr-2" />
                    <h3 className="font-bold">Application Deadline</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(job.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
