import { BriefcaseIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const JobCard = ({ job, onEdit, onDelete, onToggleStatus, showActions = true }) => {
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

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (!max) return `$${min?.toLocaleString()}+`;
    if (!min) return `Up to $${max?.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <BriefcaseIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          </div>
          {job.companyName && <p className="text-gray-700 mb-1">{job.companyName}</p>}
          <p className="text-gray-600 mb-2">{job.department}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span className="capitalize">{job.type}</span>
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex space-x-4">
          <span>{job.applicationsCount || 0} applications</span>
          <span>{job.interviewsCount || 0} interviews</span>
        </div>
        <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
      </div>

      {job.requirements && job.requirements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
          <div className="flex flex-wrap gap-1">
            {job.requirements.slice(0, 3).map((req, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                {req}
              </span>
            ))}
            {job.requirements.length > 3 && (
              <span className="text-xs text-gray-500">
                +{job.requirements.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(job)}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              Edit
            </button>
            <button
              onClick={() => onToggleStatus(job)}
              className={`px-3 py-1 text-sm border rounded hover:opacity-80 ${
                job.status === 'active'
                  ? 'text-yellow-600 border-yellow-600 hover:bg-yellow-50'
                  : 'text-green-600 border-green-600 hover:bg-green-50'
              }`}
            >
              {job.status === 'active' ? 'Pause' : 'Activate'}
            </button>
          </div>
          <button
            onClick={() => onDelete(job)}
            className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default JobCard;