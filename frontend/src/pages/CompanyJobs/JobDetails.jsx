import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApplicationModal from '../JobMatch/ApplicationModal';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/check-auth', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data?.data?.user) setCurrentUser(data.data.user);
    } catch {
      // Not logged in – user can still view the job.
    }
  };

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
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    setShowApplyModal(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplyModal(false);
    setApplied(true);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `LKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From LKR ${min.toLocaleString()}`;
    return `Up to LKR ${max.toLocaleString()}`;
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const target = new Date(deadline);
    target.setHours(0, 0, 0, 0);

    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (Number.isNaN(diff)) return null;
    if (diff < 0) return 'Expired';
    return `${diff} day${diff === 1 ? '' : 's'} left`;
  };

  const getInitials = (value) => {
    const parts = String(value || 'Company').trim().split(' ').filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'CO';
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
            onClick={() => navigate('/jobs')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <button
            onClick={() => navigate('/jobs')}
            className="mb-5 inline-flex items-center text-cyan-100 hover:text-white font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Listings
          </button>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-4xl">{job.title}</h1>
          <p className="text-xl md:text-3xl text-cyan-100 font-semibold mt-2">{job.companyName || 'Company'}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description || 'No description provided.'}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-cyan-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Qualifications</h2>
                <ul className="space-y-3">
                  {job.skills.map((skill, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-cyan-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 sticky top-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 mb-4 flex items-center justify-center text-xl font-bold text-gray-600">
                {job.companyImage ? (
                  <img src={job.companyImage} alt={job.companyName || 'Company'} className="w-full h-full object-cover" />
                ) : (
                  getInitials(job.companyName)
                )}
              </div>

              <h3 className="text-3xl font-bold text-gray-900 leading-snug">{job.title}</h3>
              <p className="text-xl text-gray-700 font-semibold mt-1">{job.companyName || 'Company'}</p>

              <div className="mt-4 space-y-2 text-gray-600">
                <p className="inline-flex items-center text-lg">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  {job.location || 'N/A'}
                </p>
                <p className="inline-flex items-center text-lg">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  {getDaysLeft(job.deadline) || 'No deadline'}
                </p>
                <p className="inline-flex items-center text-lg">
                  <BriefcaseIcon className="w-5 h-5 mr-2" />
                  <span className="capitalize">{job.type || 'N/A'}</span>
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200 space-y-3 text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Department</span>
                  <span className="font-semibold text-gray-900">{job.department || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-semibold text-gray-900">{job.experience || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Salary</span>
                  <span className="font-semibold text-gray-900 text-right">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 inline-flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Deadline
                    </span>
                    <span className="font-semibold text-gray-900 text-right">
                      {new Date(job.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {applied ? (
                <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-center font-semibold">
                  ✓ Application submitted! Track it in{' '}
                  <button
                    onClick={() => navigate('/my-applications')}
                    className="underline hover:text-green-900"
                  >
                    My Applications
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  className="w-full mt-6 py-3 bg-lime-500 text-white rounded-lg font-bold hover:bg-lime-600 transition-colors"
                >
                  APPLY FOR JOB
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {showApplyModal && job && (
        <ApplicationModal
          job={job}
          studentId={currentUser?.id}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
};

export default JobDetails;
