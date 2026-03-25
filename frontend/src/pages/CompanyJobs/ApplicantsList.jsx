import { useState, useEffect } from 'react';
import { UserGroupIcon, EyeIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

const ApplicantsList = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchApplicants();
    }
  }, [selectedJob]);

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

  const fetchApplicants = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/job/${selectedJob}`);
      if (response.ok) {
        const data = await response.json();
        setApplicants(data);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchApplicants();
        alert(`Application ${newStatus} successfully!`);
      } else {
        alert('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview-scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAndSortedApplicants = applicants
    .filter(applicant => statusFilter === 'all' || applicant.status === statusFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.appliedAt) - new Date(a.appliedAt);
        case 'name':
          return a.student.name.localeCompare(b.student.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatsForJob = () => {
    if (!applicants.length) return { total: 0, pending: 0, accepted: 0, rejected: 0 };
    
    return {
      total: applicants.length,
      pending: applicants.filter(app => app.status === 'pending').length,
      accepted: applicants.filter(app => app.status === 'accepted').length,
      rejected: applicants.filter(app => app.status === 'rejected').length,
      interviewed: applicants.filter(app => app.status === 'interview-scheduled').length
    };
  };

  const stats = getStatsForJob();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Applicants Management</h1>
          <p className="text-gray-600 mt-2">View and manage job applications</p>
        </div>

        {/* Job Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a job to view applicants...</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} - {job.department}
                  </option>
                ))}
              </select>
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
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="interview-scheduled">Interview Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Application Date</option>
                <option value="name">Applicant Name</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchApplicants}
                disabled={!selectedJob}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {selectedJob && applicants.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.interviewed}</p>
              <p className="text-sm text-gray-600">Interviewed</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        )}

        {/* Applicants List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedJob ? 
                `Applicants for ${jobs.find(j => j._id === selectedJob)?.title} (${filteredAndSortedApplicants.length})` :
                'Select a job to view applicants'
              }
            </h2>
          </div>

          {!selectedJob ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a job from the dropdown to view its applicants.</p>
            </div>
          ) : filteredAndSortedApplicants.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applicants found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' ?
                  'No applicants match the selected filter criteria.' :
                  'This job has not received any applications yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
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
                  {filteredAndSortedApplicants.map((applicant) => (
                    <tr key={applicant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {applicant.student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {applicant.student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {applicant.student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {applicant.student.university}
                        </div>
                        <div className="text-sm text-gray-500">
                          {applicant.student.major} • GPA: {applicant.student.gpa}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {applicant.student.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                              {skill}
                            </span>
                          ))}
                          {applicant.student.skills?.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{applicant.student.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(applicant.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                          {applicant.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(applicant.student.resumeUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Resume"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {applicant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateApplicationStatus(applicant._id, 'interview-scheduled')}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                                title="Schedule Interview"
                                disabled={loading}
                              >
                                <ClockIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateApplicationStatus(applicant._id, 'accepted')}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                title="Accept Application"
                                disabled={loading}
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateApplicationStatus(applicant._id, 'rejected')}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Reject Application"
                                disabled={loading}
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsList;