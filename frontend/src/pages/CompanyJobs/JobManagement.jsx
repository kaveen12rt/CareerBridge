import { useState, useEffect, useMemo } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, PauseIcon, PlayIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { analyzeJobPostQuality } from './jobQualityAnalyzer';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleUpdateJob = async (jobId, updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        await fetchJobs();
        setEditingJob(null);
        alert('Job updated successfully!');
      } else {
        alert('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchJobs();
        alert('Job deleted successfully!');
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await handleUpdateJob(jobId, { status: newStatus });
  };

  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.trim().toLowerCase();
    const title = String(job?.title || '').toLowerCase();
    const department = String(job?.department || '').toLowerCase();
    const companyName = String(job?.companyName || '').toLowerCase();
    const location = String(job?.location || '').toLowerCase();
    const type = String(job?.type || '').toLowerCase();

    const matchesSearch =
      !term ||
      title.includes(term) ||
      department.includes(term) ||
      companyName.includes(term) ||
      location.includes(term) ||
      type.includes(term);

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyInitials = (name) => {
    const parts = String(name || 'Company').trim().split(' ').filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
    return initials || 'CO';
  };

  const getQualityBadge = (score) => {
    if (score >= 85) {
      return 'bg-emerald-100 text-emerald-800';
    }

    if (score >= 70) {
      return 'bg-blue-100 text-blue-800';
    }

    if (score >= 50) {
      return 'bg-amber-100 text-amber-800';
    }

    return 'bg-rose-100 text-rose-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">View, edit, and manage your job postings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, company, department, location, or type..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchJobs}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Jobs ({filteredJobs.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location & Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  (() => {
                    const quality = analyzeJobPostQuality(job);
                    return (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                          {job.companyImage ? (
                            <img
                              src={job.companyImage}
                              alt={job.companyName || 'Company'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getCompanyInitials(job.companyName)
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.companyName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{job.department}</div>
                          <div className="text-xs text-gray-400">
                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.location}</div>
                      <div className="text-sm text-gray-500 capitalize">{job.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.applicationsCount || 0} applications</div>
                      <div className="text-sm text-gray-500">{job.interviewsCount || 0} interviews</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit px-2 py-1 text-xs font-semibold rounded-full ${getQualityBadge(quality.score)}`}>
                          {quality.score}/100
                        </span>
                        <span className="text-xs text-gray-500">{quality.tier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingJob(job)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit Job"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleJobStatus(job._id, job.status)}
                          className={`p-1 rounded hover:bg-gray-50 ${
                            job.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          title={job.status === 'active' ? 'Pause Job' : 'Activate Job'}
                        >
                          {job.status === 'active' ? 
                            <PauseIcon className="h-4 w-4" /> : 
                            <PlayIcon className="h-4 w-4" />
                          }
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Job"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-8">
              <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by posting your first job.'}
              </p>
            </div>
          )}
        </div>

        {/* Edit Job Modal */}
        {editingJob && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white mb-10">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Job</h3>
                <JobEditForm
                  job={editingJob}
                  onSave={(updatedData) => handleUpdateJob(editingJob._id, updatedData)}
                  onCancel={() => setEditingJob(null)}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Job Edit Form Component
const JobEditForm = ({ job, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    companyName: job.companyName || '',
    companyImage: job.companyImage || '',
    title: job.title || '',
    department: job.department || '',
    location: job.location || '',
    type: job.type || 'full-time',
    salaryMin: job.salaryMin || '',
    salaryMax: job.salaryMax || '',
    description: job.description || '',
    requirements: job.requirements || [''],
    skills: job.skills || [''],
    experience: job.experience || '',
    deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    status: job.status || 'active'
  });
  const qualityAnalysis = useMemo(() => analyzeJobPostQuality(formData), [formData]);

  const getQualityTheme = (score) => {
    if (score >= 85) {
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }

    if (score >= 70) {
      return 'bg-blue-50 border-blue-200 text-blue-700';
    }

    if (score >= 50) {
      return 'bg-amber-50 border-amber-200 text-amber-700';
    }

    return 'bg-rose-50 border-rose-200 text-rose-700';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (qualityAnalysis.criticalIssues.length > 0) {
      alert(`Please fix these issues before saving:\n- ${qualityAnalysis.criticalIssues.join('\n- ')}`);
      return;
    }

    if (qualityAnalysis.score < 70) {
      const shouldContinue = confirm(
        `Job quality score is ${qualityAnalysis.score}/100 (${qualityAnalysis.tier}). Save anyway?`
      );

      if (!shouldContinue) {
        return;
      }
    }

    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index, field) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className={`border rounded-lg p-4 ${getQualityTheme(qualityAnalysis.score)}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold">AI Job Quality Analyzer</h4>
            <p className="text-sm opacity-90">Review quality before updating this vacancy.</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide font-semibold">Score</p>
            <p className="text-2xl font-bold">{qualityAnalysis.score}/100</p>
            <p className="text-xs font-semibold uppercase tracking-wide">{qualityAnalysis.tier}</p>
          </div>
        </div>

        {qualityAnalysis.warnings.length > 0 && (
          <ul className="mt-3 text-sm list-disc list-inside space-y-1">
            {qualityAnalysis.warnings.slice(0, 3).map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Min)</label>
          <input
            type="number"
            name="salaryMin"
            value={formData.salaryMin}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Max)</label>
          <input
            type="number"
            name="salaryMax"
            value={formData.salaryMax}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="80000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2-4 years"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'companyImage')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.companyImage && (
            <img src={formData.companyImage} alt="Company" className="mt-2 h-16 w-16 rounded-md object-cover" />
          )}
        </div>

      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
        <textarea
          name="description"
          required
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the job role and responsibilities..."
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
        <div className="space-y-2">
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={req}
                onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a requirement..."
              />
              {formData.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'requirements')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('requirements')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Requirement
          </button>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
        <div className="space-y-2">
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a skill..."
              />
              {formData.skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'skills')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('skills')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default JobManagement;