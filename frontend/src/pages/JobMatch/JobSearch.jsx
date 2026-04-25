import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';
import heroImage from '../../assets/job-hero.jpg';
import JobPostingForm from '../CompanyJobs/JobPostingForm';

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

const JobSearch = ({ currentUser }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [allActiveJobs, setAllActiveJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs?status=active', {
          credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch jobs');
        }

        setAllActiveJobs(Array.isArray(data) ? data : []);
      } catch {
        setAllActiveJobs([]);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        params.append('status', 'active');

        if (searchText.trim()) params.append('search', searchText.trim());
        if (locationFilter !== 'all') params.append('location', locationFilter);
        if (departmentFilter !== 'all') params.append('department', departmentFilter);
        if (jobTypeFilter !== 'all') params.append('jobType', jobTypeFilter);
        params.append('sort', sortBy);
        if (urgentOnly) params.append('urgent', 'true');

        const response = await fetch(`http://localhost:5000/api/jobs?${params.toString()}`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch jobs');
        }

        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchText, locationFilter, departmentFilter, jobTypeFilter, sortBy, urgentOnly]);

  const locationOptions = useMemo(() => {
    return [...new Set(allActiveJobs.map((job) => String(job?.location || '').trim()).filter(Boolean))].sort();
  }, [allActiveJobs]);

  const departmentOptions = useMemo(() => {
    return [...new Set(allActiveJobs.map((job) => String(job?.department || '').trim()).filter(Boolean))].sort();
  }, [allActiveJobs]);

  const jobTypeOptions = useMemo(() => {
    return [...new Set(allActiveJobs.map((job) => String(job?.type || '').trim()).filter(Boolean))].sort();
  }, [allActiveJobs]);

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative overflow-hidden bg-blue-900"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.85), rgba(30, 64, 175, 0.8), rgba(15, 23, 42, 0.85)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.2),transparent_55%)]" />
        <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-orange-400/30 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-700/40 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-orange-200 bg-white/10 px-3 py-1 rounded-full">
              CareerBridge Job Search
            </span>
            {currentUser?.role === 'company' && (
              <button
                type="button"
                onClick={() => setShowPostJob(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition"
              >
                Post Job
              </button>
            )}
          </div>

          <div className="mt-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Find your next role with
                <span className="text-orange-300"> confidence</span>.
              </h1>
              <p className="text-blue-100 mt-4 text-lg max-w-2xl">
                Search smarter with a premium layout inspired by modern job boards.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg">
                <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                  <p className="text-xs text-blue-100">Active jobs</p>
                  <p className="text-xl font-bold text-white">{jobs.length}</p>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                  <p className="text-xs text-blue-100">Urgent roles</p>
                  <p className="text-xl font-bold text-orange-300">
                    {jobs.filter((job) => {
                      const daysLeft = getDaysLeft(job.deadline);
                      return daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
                    }).length}
                  </p>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                  <p className="text-xs text-blue-100">Locations</p>
                  <p className="text-xl font-bold text-white">{locationOptions.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white/95 backdrop-blur border border-white/40 rounded-2xl shadow-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3">
              <input
                type="text"
                className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by job title, company, department, or location..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 text-blue-900"
              >
                <option value="all">All Locations</option>
                {locationOptions.map((location) => (
                  <option key={`location-${location}`} value={location}>{location}</option>
                ))}
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 text-blue-900"
              >
                <option value="all">All Departments</option>
                {departmentOptions.map((department) => (
                  <option key={`department-${department}`} value={department}>{department}</option>
                ))}
              </select>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 text-blue-900"
              >
                <option value="all">All Job Types</option>
                {jobTypeOptions.map((type) => (
                  <option key={`type-${type}`} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 text-blue-900"
              >
                <option value="recent">Recently Added</option>
                <option value="oldest">Oldest Posts</option>
              </select>
              <label className="inline-flex items-center gap-2 border border-blue-200 rounded-lg px-3 py-2 text-blue-900">
                <input
                  type="checkbox"
                  checked={urgentOnly}
                  onChange={(e) => setUrgentOnly(e.target.checked)}
                />
                Urgent only
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-blue-700/80">
              <span>Showing {jobs.length} job{jobs.length === 1 ? '' : 's'}</span>
              <button
                type="button"
                onClick={() => {
                  setSearchText('');
                  setLocationFilter('all');
                  setDepartmentFilter('all');
                  setJobTypeFilter('all');
                  setSortBy('recent');
                  setUrgentOnly(false);
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <main>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-blue-900">Job results</h2>
                <p className="text-sm text-blue-700/80">{jobs.length} results found</p>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 text-blue-900"
              >
                <option value="recent">Recently Added</option>
                <option value="oldest">Oldest Posts</option>
              </select>
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 text-blue-700">
                Loading jobs...
              </div>
            ) : null}
            {error ? (
              <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-orange-700">
                {error}
              </div>
            ) : null}

            {!loading && !error && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job) => {
                  const salaryMin = typeof job?.salaryMin === 'number' ? job.salaryMin.toLocaleString() : null;
                  const salaryMax = typeof job?.salaryMax === 'number' ? job.salaryMax.toLocaleString() : null;
                  const description = String(job?.description || '').trim();
                  return (
                    <div
                      key={job._id}
                      className="bg-white rounded-2xl border border-blue-100 shadow-md p-5 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition"
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-blue-100 bg-blue-50 flex items-center justify-center text-lg font-bold text-blue-700 flex-shrink-0">
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
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">{job.title}</h3>
                            <p className="text-sm text-blue-700/80">{job.companyName || 'N/A'}</p>
                          </div>
                        </div>
                        <BookmarkIcon className="w-5 h-5 text-blue-300" />
                      </div>

                      {description ? (
                        <p
                          className="text-sm text-blue-700/80 break-words"
                          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {description}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800">
                          <MapPinIcon className="w-4 h-4" />
                          {job.location || 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800">
                          <BriefcaseIcon className="w-4 h-4" />
                          {job.type || 'N/A'}
                        </span>
                        {job?.experienceLevel ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800">
                            {job.experienceLevel}
                          </span>
                        ) : null}
                        {salaryMin || salaryMax ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700">
                            Salary {salaryMin || 'N/A'}{salaryMax ? ` - ${salaryMax}` : ''}
                          </span>
                        ) : null}
                        {(() => {
                          const daysLeft = getDaysLeft(job.deadline);
                          if (daysLeft === null || daysLeft > 7 || daysLeft < 0) return null;
                          return (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500 text-white font-semibold">
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                              Urgent
                            </span>
                          );
                        })()}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="inline-flex items-center gap-2 text-sm text-blue-700/80">
                          <ClockIcon className="w-4 h-4" />
                          {(() => {
                            const daysLeft = getDaysLeft(job.deadline);
                            if (daysLeft === null) return 'No deadline';
                            if (daysLeft < 0) return 'Expired';
                            return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
                          })()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/jobs/${job._id}`);
                            }}
                            className="px-4 py-2 rounded-lg border border-blue-200 text-blue-900 font-semibold hover:bg-blue-50"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/jobs/${job._id}`);
                            }}
                            className="px-4 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {jobs.length === 0 ? (
                  <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-blue-100 bg-white p-8 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 mb-4">
                      <BriefcaseIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-blue-900">No matching jobs</h3>
                    <p className="text-blue-700/80 mt-2">Try clearing filters or search with a different keyword.</p>
                  </div>
                ) : null}
              </div>
            )}
          </main>
      </section>

      {showPostJob && currentUser?.role === 'company' && (
        <div className="fixed inset-0 z-[40] bg-slate-900/60 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 sm:p-8">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
              <div className="flex items-center justify-end px-4 py-3 border-b border-blue-100">
                <button
                  type="button"
                  onClick={() => setShowPostJob(false)}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-0">
                <JobPostingForm
                  embedded
                  initialValues={{
                    companyName: currentUser?.companyProfile?.companyName || '',
                    companyImage: currentUser?.companyProfile?.logo || '',
                  }}
                  onPosted={() => {
                    setShowPostJob(false);
                    // refresh list (re-run effect by toggling a filter)
                    setSortBy((prev) => (prev === 'recent' ? 'recent' : 'recent'));
                  }}
                  onClose={() => setShowPostJob(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
