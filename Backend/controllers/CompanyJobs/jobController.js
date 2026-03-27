import Job from "../../models/CompanyJobs/Job.js";
import InterviewSlot from "../../models/CompanyJobs/InterviewSlot.js";
import mongoose from "mongoose";

// Create sample jobs for testing
const createSampleJobs = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");

    const sampleJobs = [
      {
        title: "HR Manager",
        department: "HR department",
        location: "Colombo",
        type: "full-time",
        salaryMin: 60000,
        salaryMax: 70000,
        description:
          "Manage HR team and oversee all human resources functions including recruitment, employee relations, performance management, and compliance.",
        requirements: [
          "Bachelor Degree in HR",
          "Minimum 2 years of HR management experience",
          "Strong knowledge of labor laws and regulations",
          "Excellent communication and interpersonal skills",
        ],
        skills: [
          "HR Management",
          "Recruitment",
          "Employee Relations",
          "Performance Management",
        ],
        experience: "2 years",
        deadline: new Date("2026-03-12"),
        image:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
        companyId,
        applicationsCount: 5,
        interviewsCount: 2,
      },
      {
        title: "Software Engineer",
        department: "Engineering",
        location: "San Francisco, CA",
        type: "full-time",
        salaryMin: 80000,
        salaryMax: 120000,
        description:
          "We are looking for a skilled Software Engineer to join our team and work on cutting-edge web applications.",
        requirements: [
          "Bachelor's degree in Computer Science",
          "3+ years experience",
          "JavaScript proficiency",
          "Strong problem-solving skills",
        ],
        skills: ["React", "Node.js", "MongoDB", "TypeScript", "Git"],
        experience: "3-5 years",
        deadline: new Date("2026-04-15"),
        image:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
        companyId,
        applicationsCount: 15,
        interviewsCount: 5,
      },
      {
        title: "Product Manager",
        department: "Product",
        location: "New York, NY",
        type: "full-time",
        salaryMin: 90000,
        salaryMax: 140000,
        description:
          "Join our product team to help build the next generation of our platform.",
        requirements: [
          "MBA or equivalent experience",
          "5+ years product management",
          "Agile methodology",
          "Data-driven decision making",
        ],
        skills: [
          "Product Strategy",
          "Data Analysis",
          "User Research",
          "Agile",
          "Roadmapping",
        ],
        experience: "5-7 years",
        deadline: new Date("2026-03-30"),
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        companyId,
        applicationsCount: 8,
        interviewsCount: 3,
      },
      {
        title: "UX Designer",
        department: "Design",
        location: "Los Angeles, CA",
        type: "full-time",
        salaryMin: 70000,
        salaryMax: 100000,
        description:
          "Create amazing user experiences for our growing user base.",
        requirements: [
          "Portfolio of design work",
          "3+ years UX experience",
          "Figma proficiency",
          "Strong understanding of user-centered design",
        ],
        skills: [
          "Figma",
          "User Research",
          "Prototyping",
          "Wireframing",
          "UI Design",
        ],
        experience: "3-5 years",
        deadline: new Date("2026-04-01"),
        image:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
        companyId,
        applicationsCount: 12,
        interviewsCount: 4,
      },
      {
        title: "Data Analyst",
        department: "Analytics",
        location: "Remote",
        type: "full-time",
        salaryMin: 65000,
        salaryMax: 95000,
        description:
          "Analyze complex datasets to provide actionable insights that drive business decisions.",
        requirements: [
          "Bachelor's degree in Statistics, Mathematics, or related field",
          "2+ years of data analysis experience",
          "SQL proficiency",
          "Experience with visualization tools",
        ],
        skills: ["SQL", "Python", "Tableau", "Excel", "Statistical Analysis"],
        experience: "2-4 years",
        deadline: new Date("2026-04-20"),
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
        companyId,
        applicationsCount: 10,
        interviewsCount: 3,
      },
      {
        title: "Marketing Specialist",
        department: "Marketing",
        location: "Chicago, IL",
        type: "full-time",
        salaryMin: 55000,
        salaryMax: 75000,
        description:
          "Drive marketing campaigns and initiatives to increase brand awareness and generate leads.",
        requirements: [
          "Bachelor's degree in Marketing or related field",
          "2+ years marketing experience",
          "Digital marketing expertise",
          "Strong creative and analytical skills",
        ],
        skills: [
          "Digital Marketing",
          "Content Creation",
          "SEO",
          "Social Media",
          "Google Analytics",
        ],
        experience: "2-3 years",
        deadline: new Date("2026-03-25"),
        image:
          "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&h=300&fit=crop",
        companyId,
        applicationsCount: 18,
        interviewsCount: 6,
      },
    ];

    await Job.deleteMany({});
    const jobs = await Job.insertMany(sampleJobs);

    res.json({ message: "Sample jobs created successfully", jobs });
  } catch (error) {
    res.status(500).json({
      message: "Error creating sample jobs",
      error: error.message,
    });
  }
};

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching job",
      error: error.message,
    });
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
      deadline,
    } = req.body;

    if (!title || !department || !location || !description) {
      return res.status(400).json({
        message: "Missing required fields: title, department, location, description",
      });
    }

    const companyId = "507f1f77bcf86cd799439011";

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
      companyId,
    });

    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({
      message: "Error creating job",
      error: error.message,
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({
      message: "Error updating job",
      error: error.message,
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await InterviewSlot.deleteMany({ jobId: id });
    await Job.findByIdAndDelete(id);

    res.json({
      message: "Job and associated interview slots deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      message: "Error deleting job",
      error: error.message,
    });
  }
};

// Get job statistics
const getJobsStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "active" });

    const totalApplicants = await Job.aggregate([
      { $group: { _id: null, total: { $sum: "$applicationsCount" } } },
    ]);

    const scheduledInterviews = await Job.aggregate([
      { $group: { _id: null, total: { $sum: "$interviewsCount" } } },
    ]);

    const stats = {
      totalJobs,
      activeJobs,
      totalApplicants: totalApplicants[0]?.total || 0,
      scheduledInterviews: scheduledInterviews[0]?.total || 0,
    };

    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title location type applicationsCount status createdAt");

    res.json({ stats, recentJobs });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

export {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsStats,
  createSampleJobs,
};