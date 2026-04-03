import { useState } from 'react';
import { XMarkIcon, BriefcaseIcon, MapPinIcon } from '@heroicons/react/24/outline';

/**
 * Modal shown when a student clicks "APPLY FOR JOB".
 *
 * Props:
 *   job        – Job object (must have _id, title, companyName, location)
 *   studentId  – Logged-in student's _id (string). Pass null if not authenticated.
 *   onClose    – Called when the user cancels.
 *   onSuccess  – Called with the newly created application object on success.
 */
const ApplicationModal = ({ job, studentId, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!studentId) {
      setError('You must be signed in to apply. Please sign in and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId, jobId: job._id, coverLetter }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to submit application. Please try again.');
        return;
      }

      onSuccess(data.application);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-2xl flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Apply for Position</h2>
            <p className="text-blue-200 mt-1 font-semibold text-lg">{job.title}</p>
            <div className="flex items-center gap-4 mt-1 text-blue-300 text-sm">
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="w-4 h-4" />
                {job.companyName}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {job.location}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-blue-300 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error banner */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 2-application limit notice */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Heads up:</strong> You may have a maximum of{' '}
            <strong>2 active applications</strong> at a time. Withdraw an existing application
            first if you have reached the limit.
          </div>

          {/* Cover letter */}
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cover Letter{' '}
            <span className="font-normal text-gray-400">(optional, max 2000 characters)</span>
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            maxLength={2000}
            rows={5}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-60"
            placeholder="Briefly describe why you are a great fit for this role…"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{coverLetter.length} / 2000</p>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !studentId}
              className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
