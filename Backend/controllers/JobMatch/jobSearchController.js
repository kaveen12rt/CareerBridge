const Job = require('../../models/CompanyJobs/Job');

const normalize = (value) => String(value || '').trim().toLowerCase();

const tokenize = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const searchJobs = async (req, res) => {
  try {
    const { q = '', location = '', type = '', skills = '' } = req.query;

    const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });

    const searchText = normalize(q);
    const locationText = normalize(location);
    const typeText = normalize(type);
    const skillList = tokenize(skills).map(normalize);

    const filtered = jobs.filter((job) => {
      const title = normalize(job.title);
      const department = normalize(job.department);
      const description = normalize(job.description);
      const jobLocation = normalize(job.location);
      const jobType = normalize(job.type);
      const jobSkills = (job.skills || []).map(normalize);

      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        department.includes(searchText) ||
        description.includes(searchText);

      const matchesLocation = !locationText || jobLocation.includes(locationText);
      const matchesType = !typeText || jobType === typeText;
      const matchesSkills =
        skillList.length === 0 || skillList.every((skill) => jobSkills.includes(skill));

      return matchesSearch && matchesLocation && matchesType && matchesSkills;
    });

    res.json({ total: filtered.length, jobs: filtered });
  } catch (error) {
    res.status(500).json({ message: 'Error searching jobs', error: error.message });
  }
};

module.exports = {
  searchJobs
};
