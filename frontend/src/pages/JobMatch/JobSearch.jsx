import { useEffect, useMemo, useState } from 'react';

const JobSearch = () => {
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
      const department = String(job.department || '').toLowerCase();
      const location = String(job.location || '').toLowerCase();
      const description = String(job.description || '').toLowerCase();

      return (
        title.includes(text) ||
        department.includes(text) ||
        location.includes(text) ||
        description.includes(text)
      );
    });
  }, [jobs, searchText]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Search</h1>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Search by job title, department, or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {loading ? <p className="text-gray-600">Loading jobs...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map((job) => (
              <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{job.department} • {job.location} • {job.type}</p>
                <p className="text-gray-700 mt-3 line-clamp-3">{job.description}</p>
              </div>
            ))}
            {filteredJobs.length === 0 ? (
              <p className="text-gray-600">No matching jobs found.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
