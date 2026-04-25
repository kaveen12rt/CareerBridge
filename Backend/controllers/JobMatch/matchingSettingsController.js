import MatchSettings from '../../models/JobMatch/MatchSettings.js';
import Job from '../../models/CompanyJobs/Job.js';

const normalize = (value) => String(value || '').trim().toLowerCase();

const calculateMatchScore = (job, settings) => {
  const jobSkills = [
    ...(job.skills || []),
    ...(job.requirements || [])
  ].map(normalize);

  const preferredSkills = (settings.preferredSkills || []).map(normalize);

  const skillScore =
    preferredSkills.length === 0
      ? 0
      : (preferredSkills.filter((skill) => jobSkills.some((js) => js.includes(skill) || skill.includes(js))).length /
          preferredSkills.length) *
        50;

  const locationScore = (settings.preferredLocations || [])
    .map(normalize)
    .some((location) => normalize(job.location).includes(location))
    ? 30
    : 0;

  const typeScore = (settings.preferredJobTypes || [])
    .map(normalize)
    .includes(normalize(job.type))
    ? 20
    : 0;

  return Math.round(skillScore + locationScore + typeScore);
};

export const getSettings = async (req, res) => {
  try {
    const studentId = String(req.user?.id || '');
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const settings = await MatchSettings.findOne({ studentId });

    if (!settings) {
      // Return empty defaults instead of 404 so the frontend can render the form
      return res.json({
        studentId,
        preferredLocations: [],
        preferredJobTypes: [],
        preferredSkills: [],
        minimumMatchScore: 0,
        preferredSalaryMin: 0
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching match settings', error: error.message });
  }
};

export const upsertSettings = async (req, res) => {
  try {
    const studentId = String(req.user?.id || '');
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const payload = {
      preferredLocations: req.body.preferredLocations || [],
      preferredJobTypes: req.body.preferredJobTypes || [],
      preferredSkills: req.body.preferredSkills || [],
      minimumMatchScore: req.body.minimumMatchScore ?? 0,
      preferredSalaryMin: req.body.preferredSalaryMin ?? 0
    };

    const settings = await MatchSettings.findOneAndUpdate(
      { studentId },
      { studentId, ...payload },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error saving match settings', error: error.message });
  }
};

export const clearSettings = async (req, res) => {
  try {
    const studentId = String(req.user?.id || '');
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    await MatchSettings.findOneAndDelete({ studentId });
    res.json({ message: 'Match settings cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing match settings', error: error.message });
  }
};

export const previewMatches = async (req, res) => {
  try {
    const studentId = String(req.user?.id || '');
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const settings = await MatchSettings.findOne({ studentId });

    if (!settings) {
      return res.status(404).json({ message: 'Match settings not found. Save your preferences first.' });
    }

    const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });

    const ranked = jobs
      .map((job) => ({ ...job.toObject(), matchScore: calculateMatchScore(job, settings) }))
      .filter((job) => job.matchScore >= (settings.minimumMatchScore || 0))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      settings,
      total: ranked.length,
      jobs: ranked
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating match preview', error: error.message });
  }
};
