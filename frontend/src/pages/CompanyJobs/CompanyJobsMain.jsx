import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CompanyJobsNavigation from '../../components/CompanyJobs/CompanyJobsNavigation';
import {
  CompanyDashboard,
  JobPostingForm,
  JobManagement
} from './index';

const CompanyJobsMain = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const navigate = useNavigate();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <CompanyDashboard onNavigate={setCurrentPage} />;
      case 'post-job':
        return <JobPostingForm />;
      case 'manage-jobs':
        return <JobManagement />;
      default:
        return <CompanyDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Home Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">← Back to Admin Home</span>
        </button>
      </div>
      
      <CompanyJobsNavigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
      {renderCurrentPage()}
    </div>
  );
};

export default CompanyJobsMain;