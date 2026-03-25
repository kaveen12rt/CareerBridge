import { useNavigate } from 'react-router-dom';

const JobMatchMain = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">JobMatch Admin</h1>
        <p className="text-gray-600 mb-8">Member 3 module controls: Job Search, Smart Matching, and CV Generator.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/jobs')}
            className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500 text-left hover:shadow-lg hover:bg-indigo-50 transition-all"
          >
            <h2 className="text-xl font-bold text-indigo-700">Job Search</h2>
            <p className="text-sm text-gray-600 mt-2">Search and view active jobs with filtering.</p>
          </button>

          <button
            onClick={() => navigate('/smart-matching')}
            className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 text-left hover:shadow-lg hover:bg-purple-50 transition-all"
          >
            <h2 className="text-xl font-bold text-purple-700">Smart Matching</h2>
            <p className="text-sm text-gray-600 mt-2">Rank jobs based on student preferred skills.</p>
          </button>

          <button
            onClick={() => navigate('/cv-generator')}
            className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500 text-left hover:shadow-lg hover:bg-emerald-50 transition-all"
          >
            <h2 className="text-xl font-bold text-emerald-700">CV Generator</h2>
            <p className="text-sm text-gray-600 mt-2">Build and preview CV content quickly.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobMatchMain;
