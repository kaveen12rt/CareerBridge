import { useEffect, useMemo, useState } from 'react';

const SmartMatching = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillsInput, setSkillsInput] = useState('react,node.js');

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

  const rankedJobs = useMemo(() => {
    const preferredSkills = skillsInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    return jobs
      .map((job) => {
        const jobSkills = (job.skills || []).map((s) => String(s).toLowerCase());
        const hitCount = preferredSkills.filter((skill) => jobSkills.includes(skill)).length;
        const score = preferredSkills.length > 0 ? Math.round((hitCount / preferredSkills.length) * 100) : 0;

        return { ...job, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [jobs, skillsInput]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Smart Matching</h1>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Skills</label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="Ex: react,node.js,mongodb"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
        </div>

        {loading ? <p className="text-gray-600">Loading jobs...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rankedJobs.map((job) => (
              <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                  <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                    Match {job.matchScore}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{job.department} • {job.location} • {job.type}</p>
                <p className="text-gray-700 mt-3 line-clamp-3">{job.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMatching;
