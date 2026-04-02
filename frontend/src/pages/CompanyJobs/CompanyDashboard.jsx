import { useState, useEffect } from 'react';
import { PlusIcon, BriefcaseIcon, PencilIcon } from '@heroicons/react/24/outline';
import { analyzeJobPostQuality } from './jobQualityAnalyzer';

const CompanyDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    averageQuality: 0,
    weakPosts: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);

  async function fetchDashboardData() {
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      if (response.ok) {
        const jobs = await response.json();
        const safeJobs = Array.isArray(jobs) ? jobs : [];
        const activeJobs = safeJobs.filter((job) => job?.status === 'active').length;
        const analyzedJobs = safeJobs.map((job) => ({
          ...job,
          quality: analyzeJobPostQuality(job),
        }));
        const qualityTotal = analyzedJobs.reduce((sum, job) => sum + (job.quality?.score || 0), 0);
        const averageQuality = analyzedJobs.length > 0 ? Math.round(qualityTotal / analyzedJobs.length) : 0;
        const weakPosts = analyzedJobs.filter((job) => (job.quality?.score || 0) < 70).length;

        setStats({
          totalJobs: safeJobs.length,
          activeJobs,
          averageQuality,
          weakPosts,
        });

        const sortedRecentJobs = [...analyzedJobs]
          .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
          .slice(0, 5)
          .map((job) => ({
            title: job?.title || 'Untitled Job',
            location: job?.location || 'N/A',
            type: job?.type || 'N/A',
            applicants: job?.applicationsCount || 0,
            status: job?.status || 'inactive',
            qualityScore: job?.quality?.score || 0,
            qualityTier: job?.quality?.tier || 'Needs Work',
          }));

        setRecentJobs(sortedRecentJobs);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchDashboardData();
    }, 0);

    return () => clearTimeout(timerId);
  }, []);

  const createSampleJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs/sample', {
        method: 'POST'
      });
      if (response.ok) {
        alert('Sample jobs created successfully!');
        fetchDashboardData();
      } else {
        alert('Failed to create sample jobs');
      }
    } catch (error) {
      console.error('Error creating sample jobs:', error);
      alert('Error creating sample jobs');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your job postings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Quality</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageQuality}/100</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-rose-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Improvement</p>
                <p className="text-2xl font-bold text-gray-900">{stats.weakPosts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('post-job')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-blue-600 font-medium">Post New Job</span>
            </button>
            <button 
              onClick={() => onNavigate('manage-jobs')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <PencilIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-medium">Manage Jobs</span>
            </button>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Job Posts</h2>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating some sample jobs or posting your first job.</p>
              <div className="mt-6 space-x-4">
                <button
                  onClick={createSampleJobs}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Create Sample Jobs
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Post Job
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getQualityBadge(job.qualityScore)}`}>
                        Quality {job.qualityScore}
                      </span>
                      <span className="text-sm text-gray-500">{job.applicants} applicants</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Quality Tier: {job.qualityTier}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;