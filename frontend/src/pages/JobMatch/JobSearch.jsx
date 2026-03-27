import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';

const getDaysLeft = (deadline) => {
  if (!deadline) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);

  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Number.isNaN(diff) ? null : diff;
};

const getLogoFallback = (companyName) => {
  const text = String(companyName || 'Company').trim();
  const initials = text
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return initials || 'CO';
};

const JobSearch = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch jobs');
        }

        setJobs((data || []).filter((job) => job.status === 'active'));
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return jobs;

    return jobs.filter((job) => {
      const title = String(job.title || '').toLowerCase();
      const companyName = String(job.companyName || '').toLowerCase();
      const department = String(job.department || '').toLowerCase();
      const location = String(job.location || '').toLowerCase();
      const description = String(job.description || '').toLowerCase();

      return (
        title.includes(text) ||
        companyName.includes(text) ||
        department.includes(text) ||
        location.includes(text) ||
        description.includes(text)
      );
    });
  }, [jobs, searchText]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Search</h1>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Search by job title, company, department, or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {loading ? <p className="text-gray-600">Loading jobs...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-5 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/jobs/${job._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/jobs/${job._id}`);
                  }
                }}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600 flex-shrink-0">
                  {job.companyImage ? (
                    <img
                      src={job.companyImage}
                      alt={job.companyName || 'Company Logo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getLogoFallback(job.companyName)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{job.title}</h2>
                    {(() => {
                      const daysLeft = getDaysLeft(job.deadline);
                      if (daysLeft === null || daysLeft > 7 || daysLeft < 0) return null;

                      return (
                        <span className="inline-flex items-center px-4 py-1 rounded-full bg-red-500 text-white text-sm font-semibold">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Urgent
                        </span>
                      );
                    })()}
                    <BookmarkIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  <p className="text-lg text-gray-800 mb-2 truncate">{job.companyName || 'N/A'}</p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
                    <span className="inline-flex items-center text-base">
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      {job.location || 'N/A'}
                    </span>
                    <span className="inline-flex items-center text-base">
                      <BriefcaseIcon className="w-5 h-5 mr-2" />
                      {job.type || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-gray-600 md:min-w-[130px] md:text-right text-base">
                  <span className="inline-flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    {(() => {
                      const daysLeft = getDaysLeft(job.deadline);
                      if (daysLeft === null) return 'No deadline';
                      if (daysLeft < 0) return 'Expired';
                      return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
                    })()}
                  </span>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 ? (
              <p className="text-gray-600 p-6">No matching jobs found.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
