import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CompanyJobsNavigation from '../../components/CompanyJobs/CompanyJobsNavigation';
import {
  CompanyDashboard,
  JobPostingForm,
  JobManagement,
  InterviewSlotManagement,
  CompanyJobsReports,
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
      case 'interview-slots':
        return <InterviewSlotManagement />;
      case 'reports':
        return <CompanyJobsReports />;
      default:
        return <CompanyDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back to Admin Button */}
      <div className="bg-blue-950 border-b border-blue-900 px-4 py-2">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors duration-200"
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