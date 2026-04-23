import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

const parseList = (value) =>
  String(value || '')
    .split(/\r?\n|,|;/)
    .map((s) => s.trim())
    .filter(Boolean);

const normalize = (s) => String(s || '').trim().toLowerCase();

// Fuzzy-ish skill match: "react" matches "react.js", "node" matches "node.js"
const skillMatches = (cvSkill, jobSkill) => {
  const a = normalize(cvSkill);
  const b = normalize(jobSkill);
  return a === b || b.includes(a) || a.includes(b);
};

const SmartMatching = () => {
  const navigate = useNavigate();

  // ── Jobs ──────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

  // ── Saved CVs ─────────────────────────────────────────────────────────────
  const [savedCvs, setSavedCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState('');
  const [userId, setUserId] = useState('');

  // ── Match Settings ────────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settings, setSettings] = useState({
    preferredLocations: [],
    preferredJobTypes: [],
    minimumMatchScore: 0
  });
  // Editable draft inside the panel
  const [draft, setDraft] = useState({
    locationInput: '',
    jobTypeInput: '',
    preferredLocations: [],
    preferredJobTypes: [],
    minimumMatchScore: 0
  });

  // ── Fetch jobs ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      setJobsError('');
      try {
        const res = await fetch('http://localhost:5000/api/jobs', {
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch jobs');
        setJobs((data || []).filter((job) => job.status === 'active'));
      } catch (err) {
        setJobsError(err.message || 'Something went wrong');
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ── Fetch saved CVs + user id ──────────────────────────────────────────────
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
        const uid = authData?.data?.user?.id;
        if (!authRes.ok || !uid) throw new Error('Sign in to use Smart Matching.');

        if (isMounted) setUserId(uid);

        const res = await fetch(`http://localhost:5000/api/job-match/cv/${uid}`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load saved CVs.');

        if (isMounted) {
          const templates = Array.isArray(data?.templates) ? data.templates : [];
          setSavedCvs(templates);
          if (templates.length > 0) setSelectedCvId(templates[0]._id);
        }
      } catch (err) {
        if (isMounted) setCvError(err.message || 'Failed to load saved CVs.');
      } finally {
        if (isMounted) setCvLoading(false);
      }
    };
    fetchSavedCvs();
    return () => { isMounted = false; };
  }, []);

  // ── Fetch match settings once user id is known ─────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    const fetchSettings = async () => {
      setSettingsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/job-match/settings', {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && isMounted) {
          const loaded = {
            preferredLocations: data.preferredLocations || [],
            preferredJobTypes: data.preferredJobTypes || [],
            minimumMatchScore: data.minimumMatchScore ?? 0
          };
          setSettings(loaded);
          setDraft({
            locationInput: '',
            jobTypeInput: '',
            ...loaded
          });
        }
      } catch {
        // Settings are optional — silently ignore fetch errors
      } finally {
        if (isMounted) setSettingsLoading(false);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, [userId]);

  // ── CV skills ──────────────────────────────────────────────────────────────
  const selectedCv = useMemo(
    () => savedCvs.find((cv) => cv._id === selectedCvId),
    [savedCvs, selectedCvId]
  );

  const cvSkills = useMemo(() => {
    if (!selectedCv) return [];
    const sections = Array.isArray(selectedCv.sections) ? selectedCv.sections : [];
    const skillsSection = sections.find((s) => normalize(s?.title) === 'skills');
    return parseList(skillsSection?.content || '');
  }, [selectedCv]);

  // ── Ranking ────────────────────────────────────────────────────────────────
  const rankedJobs = useMemo(() => {
    const preferredSkills = cvSkills;
    const { preferredLocations, preferredJobTypes, minimumMatchScore } = settings;

    return jobs
      .map((job) => {
        const jobSkillPool = [
          ...(job.skills || []),
          ...(job.requirements || [])
        ].map(normalize);

        // Skill score (50 pts) — fuzzy match
        const skillScore =
          preferredSkills.length === 0 || jobSkillPool.length === 0
            ? null
            : Math.round(
                (preferredSkills.filter((cs) =>
                  jobSkillPool.some((js) => skillMatches(cs, js))
                ).length /
                  preferredSkills.length) *
                  50
              );

        // Location score (30 pts)
        const locationScore =
          preferredLocations.length === 0
            ? 0
            : preferredLocations.map(normalize).some((loc) =>
                normalize(job.location).includes(loc)
              )
            ? 30
            : 0;

        // Job type score (20 pts)
        const typeScore =
          preferredJobTypes.length === 0
            ? 0
            : preferredJobTypes.map(normalize).includes(normalize(job.type))
            ? 20
            : 0;

        const matchScore =
          skillScore === null && preferredLocations.length === 0 && preferredJobTypes.length === 0
            ? null
            : (skillScore ?? 0) + locationScore + typeScore;

        return { ...job, matchScore };
      })
      .filter((job) =>
        minimumMatchScore === 0
          ? true
          : job.matchScore === null || job.matchScore >= minimumMatchScore
      )
      .sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
  }, [jobs, cvSkills, settings]);

  // ── Settings panel helpers ─────────────────────────────────────────────────
  const addLocation = () => {
    const val = draft.locationInput.trim();
    if (!val || draft.preferredLocations.includes(val)) return;
    setDraft((prev) => ({ ...prev, preferredLocations: [...prev.preferredLocations, val], locationInput: '' }));
  };

  const removeLocation = (loc) =>
    setDraft((prev) => ({ ...prev, preferredLocations: prev.preferredLocations.filter((l) => l !== loc) }));

  const toggleJobType = (type) =>
    setDraft((prev) => ({
      ...prev,
      preferredJobTypes: prev.preferredJobTypes.includes(type)
        ? prev.preferredJobTypes.filter((t) => t !== type)
        : [...prev.preferredJobTypes, type]
    }));

  const saveSettings = useCallback(async () => {
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const payload = {
        preferredLocations: draft.preferredLocations,
        preferredJobTypes: draft.preferredJobTypes,
        preferredSkills: cvSkills, // keep CV skills in sync
        minimumMatchScore: Number(draft.minimumMatchScore) || 0,
        preferredSalaryMin: 0
      };
      const res = await fetch('http://localhost:5000/api/job-match/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to save settings.');
      setSettings({
        preferredLocations: data.preferredLocations || [],
        preferredJobTypes: data.preferredJobTypes || [],
        minimumMatchScore: data.minimumMatchScore ?? 0
      });
      setSettingsMsg('Preferences saved.');
      setTimeout(() => setSettingsMsg(''), 3000);
    } catch (err) {
      setSettingsMsg(err.message || 'Error saving preferences.');
    } finally {
      setSettingsSaving(false);
    }
  }, [draft, cvSkills]);

  const resetSettings = useCallback(async () => {
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      await fetch('http://localhost:5000/api/job-match/settings', {
        method: 'DELETE',
        credentials: 'include'
      });
      const empty = { preferredLocations: [], preferredJobTypes: [], minimumMatchScore: 0 };
      setSettings(empty);
      setDraft({ locationInput: '', jobTypeInput: '', ...empty });
      setSettingsMsg('Preferences cleared.');
      setTimeout(() => setSettingsMsg(''), 3000);
    } catch {
      setSettingsMsg('Error clearing preferences.');
    } finally {
      setSettingsSaving(false);
    }
  }, []);

  // ── Score badge colour ─────────────────────────────────────────────────────
  const scoreBadge = (score) => {
    if (score === null) return 'bg-gray-100 text-gray-500';
    if (score >= 70) return 'bg-emerald-100 text-emerald-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-600';
  };

  const scoreLabel = (score) => (score === null ? 'Match N/A' : `Match ${score}%`);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Matching</h1>
            <p className="text-gray-600 mt-1">Jobs ranked by how well they match your CV and preferences.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen((prev) => !prev);
              setSettingsMsg('');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-medium"
          >
            <span>⚙</span> Preferences
            {(settings.preferredLocations.length > 0 ||
              settings.preferredJobTypes.length > 0 ||
              settings.minimumMatchScore > 0) && (
              <span className="ml-1 w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            )}
          </button>
        </div>

        {/* Preferences Panel */}
        {settingsOpen && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5 mb-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Match Preferences</h2>
            {settingsLoading ? (
              <p className="text-sm text-gray-500">Loading preferences...</p>
            ) : (
              <>
                {/* Preferred Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Locations
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={draft.locationInput}
                      onChange={(e) => setDraft((prev) => ({ ...prev, locationInput: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                      placeholder="e.g. Colombo"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addLocation}
                      className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  {draft.preferredLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {draft.preferredLocations.map((loc) => (
                        <span
                          key={loc}
                          className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                        >
                          {loc}
                          <button
                            type="button"
                            onClick={() => removeLocation(loc)}
                            className="ml-1 text-indigo-500 hover:text-indigo-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferred Job Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Job Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleJobType(type)}
                        className={`px-3 py-1 rounded-full text-sm border transition ${
                          draft.preferredJobTypes.includes(type)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Match Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Match Score: <span className="font-semibold text-indigo-700">{draft.minimumMatchScore}%</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={draft.minimumMatchScore}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, minimumMatchScore: Number(e.target.value) }))
                    }
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0% (show all)</span>
                    <span>100%</span>
                  </div>
                </div>

                {settingsMsg && (
                  <p className={`text-sm ${settingsMsg.includes('Error') || settingsMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {settingsMsg}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={saveSettings}
                    disabled={settingsSaving}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {settingsSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                  <button
                    type="button"
                    onClick={resetSettings}
                    disabled={settingsSaving}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-60"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* CV Selector */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Match against saved CV</label>
          {cvLoading && <p className="text-sm text-gray-500">Loading saved CVs...</p>}
          {cvError && (
            <div className="text-sm text-red-600">
              <p>{cvError}</p>
              {cvError.includes('Sign in') && (
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="mt-2 text-indigo-600 hover:underline font-medium"
                >
                  Go to Sign In →
                </button>
              )}
            </div>
          )}
          {!cvLoading && !cvError && savedCvs.length === 0 && (
            <div className="text-sm text-gray-600">
              <p>No saved CVs found. Create one first so your skills can be used for matching.</p>
              <button
                type="button"
                onClick={() => navigate('/cv-generator')}
                className="mt-2 text-indigo-600 hover:underline font-medium"
              >
                Go to CV Generator →
              </button>
            </div>
          )}
          {!cvLoading && !cvError && savedCvs.length > 0 && (
            <>
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
              >
                {savedCvs.map((cv) => (
                  <option key={cv._id} value={cv._id}>
                    {cv.name}
                  </option>
                ))}
              </select>
              {cvSkills.length > 0 ? (
                <p className="text-xs text-gray-500 mt-2">
                  Skills detected: <span className="text-gray-700">{cvSkills.join(', ')}</span>
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-2">
                  No skills found in this CV. Add a Skills section to improve matching.
                </p>
              )}
            </>
          )}
        </div>

        {/* Active filters summary */}
        {(settings.preferredLocations.length > 0 ||
          settings.preferredJobTypes.length > 0 ||
          settings.minimumMatchScore > 0) && (
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {settings.preferredLocations.map((loc) => (
              <span key={loc} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                📍 {loc}
              </span>
            ))}
            {settings.preferredJobTypes.map((type) => (
              <span key={type} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                💼 {type}
              </span>
            ))}
            {settings.minimumMatchScore > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                ≥ {settings.minimumMatchScore}% match
              </span>
            )}
          </div>
        )}

        {/* Jobs list */}
        {jobsLoading && <p className="text-gray-600">Loading jobs...</p>}
        {jobsError && <p className="text-red-600">{jobsError}</p>}

        {!jobsLoading && !jobsError && rankedJobs.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
            No jobs match your current preferences. Try lowering the minimum match score or removing filters.
          </div>
        )}

        {!jobsLoading && !jobsError && rankedJobs.length > 0 && (
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
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${scoreBadge(job.matchScore)}`}>
                    {scoreLabel(job.matchScore)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {job.department} • {job.location} • {job.type}
                </p>
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
