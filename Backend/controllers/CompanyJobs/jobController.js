const Job = require('../../models/CompanyJobs/Job');
const InterviewSlot = require('../../models/CompanyJobs/InterviewSlot');
const mongoose = require('mongoose');

// Create sample jobs for testing
const createSampleJobs = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
    
    const sampleJobs = [
      {
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        type: 'full-time',
        salaryMin: 80000,
        salaryMax: 120000,
        description: 'We are looking for a skilled Software Engineer to join our team.',
        requirements: ['Bachelor\'s degree in Computer Science', '3+ years experience', 'JavaScript proficiency'],
        skills: ['React', 'Node.js', 'MongoDB'],
        experience: '3-5 years',
        companyId,
        applicationsCount: 15,
        interviewsCount: 5
      },
      {
        title: 'Product Manager',
        department: 'Product',
        location: 'New York, NY',
        type: 'full-time',
        salaryMin: 90000,
        salaryMax: 140000,
        description: 'Join our product team to help build the next generation of our platform.',
        requirements: ['MBA or equivalent experience', '5+ years product management', 'Agile methodology'],
        skills: ['Product Strategy', 'Data Analysis', 'User Research'],
        experience: '5-7 years',
        companyId,
        applicationsCount: 8,
        interviewsCount: 3
      },
      {
        title: 'UX Designer',
        department: 'Design',
        location: 'Los Angeles, CA',
        type: 'full-time',
        salaryMin: 70000,
        salaryMax: 100000,
        description: 'Create amazing user experiences for our growing user base.',
        requirements: ['Portfolio of design work', '3+ years UX experience', 'Figma proficiency'],
        skills: ['Figma', 'User Research', 'Prototyping'],
        experience: '3-5 years',
        companyId,
        applicationsCount: 12,
        interviewsCount: 4
      }
    ];

    // Clear existing jobs and create new ones
    await Job.deleteMany({});
    const jobs = await Job.insertMany(sampleJobs);
    
    res.json({ message: 'Sample jobs created successfully', jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sample jobs', error: error.message });
  }
};

// Get all jobs for a company
const getAllJobs = async (req, res) => {
  try {
    // For now, we'll get all jobs. In a real app, filter by companyId
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

// Create new job
const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      type,
      salaryMin,
      salaryMax,
      description,
      requirements,
      skills,
      experience,
      deadline
    } = req.body;

    // Validate required fields
    if (!title || !department || !location || !description) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, department, location, description' 
      });
    }

    // For now, use a dummy companyId. In a real app, get from authenticated user
    const companyId = '507f1f77bcf86cd799439011'; // Dummy ObjectId

    const job = new Job({
      title,
      department,
      location,
      type,
      salaryMin,
      salaryMax,
      description,
      requirements: requirements || [],
      skills: skills || [],
      experience,
      deadline,
      companyId
    });

    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Also delete associated interview slots
    await InterviewSlot.deleteMany({ jobId: id });

    await Job.findByIdAndDelete(id);
    res.json({ message: 'Job and associated interview slots deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// Get jobs statistics for dashboard
const getJobsStats = async (req, res) => {
  try {
    // For now, get stats for all jobs. In a real app, filter by companyId
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplicants = await Job.aggregate([
      { $group: { _id: null, total: { $sum: '$applicationsCount' } } }
    ]);
    const scheduledInterviews = await Job.aggregate([
      { $group: { _id: null, total: { $sum: '$interviewsCount' } } }
    ]);

    const stats = {
      totalJobs,
      activeJobs,
      totalApplicants: totalApplicants[0]?.total || 0,
      scheduledInterviews: scheduledInterviews[0]?.total || 0
    };

    // Get recent jobs
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title location type applicationsCount status createdAt');

    res.json({ stats, recentJobs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsStats,
  createSampleJobs
};