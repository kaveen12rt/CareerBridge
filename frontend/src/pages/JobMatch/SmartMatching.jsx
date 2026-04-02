import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SmartMatching = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedCvs, setSavedCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState('');

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

  useEffect(() => {
    let isMounted = true;

    const fetchSavedCvs = async () => {
      setCvLoading(true);
      setCvError('');

      try {
        const authRes = await fetch('http://localhost:5000/api/auth/check-auth', {
          credentials: 'include'
        });
        const authData = await authRes.json();
        const userId = authData?.data?.user?.id;

        if (!authRes.ok || !userId) {
          throw new Error('Sign in to match with your saved CV.');
        }

        const res = await fetch(`http://localhost:5000/api/job-match/cv/${userId}`, {
          credentials: 'include'
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load saved CVs.');
        }

        if (isMounted) {
          const templates = Array.isArray(data?.templates) ? data.templates : [];
          setSavedCvs(templates);
          if (templates.length > 0) {
            setSelectedCvId(templates[0]._id);
          }
        }
      } catch (err) {
        if (isMounted) {
          setCvError(err.message || 'Failed to load saved CVs.');
        }
      } finally {
        if (isMounted) {
          setCvLoading(false);
        }
      }
    };

    fetchSavedCvs();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCv = useMemo(
    () => savedCvs.find((cv) => cv._id === selectedCvId),
    [savedCvs, selectedCvId]
  );

  const parseSkills = (value) =>
    String(value || '')
      .split(/\r?\n|,|;/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

  const cvSkills = useMemo(() => {
    if (!selectedCv) return [];
    const sections = Array.isArray(selectedCv.sections) ? selectedCv.sections : [];
    const skillsSection = sections.find((section) => String(section?.title || '').toLowerCase() === 'skills');
    return parseSkills(skillsSection?.content || '');
  }, [selectedCv]);

  const rankedJobs = useMemo(() => {
    const preferredSkills = cvSkills;

    return jobs
      .map((job) => {
        const jobSkillPool = [
          ...(job.skills || []),
          ...(job.requirements || [])
        ]
          .map((s) => String(s).toLowerCase())
          .filter(Boolean);

        if (preferredSkills.length === 0 || jobSkillPool.length === 0) {
          return { ...job, matchScore: null };
        }

        const hitCount = preferredSkills.filter((skill) => jobSkillPool.includes(skill)).length;
        const score = Math.round((hitCount / preferredSkills.length) * 100);

        return { ...job, matchScore: score };
      })
      .sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
  }, [jobs, cvSkills]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Smart Matching</h1>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Saved CV</label>
            {cvLoading ? <p className="text-sm text-gray-500">Loading saved CVs...</p> : null}
            {cvError ? <p className="text-sm text-red-600">{cvError}</p> : null}
            {!cvLoading && !cvError ? (
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >
                {savedCvs.length === 0 ? (
                  <option value="">No saved CVs found</option>
                ) : (
                  savedCvs.map((cv) => (
                    <option key={cv._id} value={cv._id}>
                      {cv.name}
                    </option>
                  ))
                )}
              </select>
            ) : null}
            {cvSkills.length > 0 ? (
              <p className="text-sm text-gray-600 mt-2">
                Using skills from your saved CV: {cvSkills.join(', ')}
              </p>
            ) : null}
          </div>
        </div>

        {loading ? <p className="text-gray-600">Loading jobs...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rankedJobs.map((job) => (
              <button
                key={job._id}
                type="button"
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                  <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {job.matchScore === null ? 'Match N/A' : `Match ${job.matchScore}%`}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{job.department} • {job.location} • {job.type}</p>
                <p className="text-gray-700 mt-3 line-clamp-3">{job.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMatching;
