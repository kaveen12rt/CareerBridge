import { useState } from 'react';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  PlusIcon, 
  PencilIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const CompanyJobsNavigation = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard',       label: 'Dashboard',        icon: HomeIcon          },
    { id: 'post-job',        label: 'Post Job',          icon: PlusIcon          },
    { id: 'manage-jobs',     label: 'Manage Jobs',       icon: PencilIcon        },
    { id: 'interview-slots', label: 'Interview Slots',   icon: CalendarDaysIcon  },
    { id: 'reports',         label: 'Reports',           icon: ChartBarIcon      },
  ];

  return (
    <nav className="bg-blue-950 shadow-sm border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-orange-300" />
              <span className="ml-2 text-xl font-bold text-white">Company Jobs</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`${
                      currentPage === item.id
                        ? 'border-orange-400 text-white bg-white/10'
                        : 'border-transparent text-blue-100 hover:text-white hover:border-blue-300'
                    } whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden bg-blue-950 border-t border-blue-900">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`${
                  currentPage === item.id
                    ? 'bg-white/10 border-orange-400 text-white'
                    : 'border-transparent text-blue-100 hover:text-white hover:bg-white/10'
                } w-full text-left block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center space-x-3`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CompanyJobsNavigation;