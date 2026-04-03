import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  PhoneIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const TYPE_ICON = {
  'in-person': MapPinIcon,
  video: VideoCameraIcon,
  phone: PhoneIcon,
};

const TYPE_LABEL = {
  'in-person': 'In-Person',
  video: 'Video Call',
  phone: 'Phone Call',
};

/**
 * Modal that lets an accepted student select and confirm an interview time slot.
 *
 * Props:
 *   application  – The application object (must have _id, jobId with _id & title)
 *   onClose      – Called when the user cancels.
 *   onBooked     – Called with { application, slot, payment } on success.
 */
const InterviewSlotPicker = ({ application, onClose, onBooked }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const jobId = application.jobId?._id || application.jobId;

  useEffect(() => {
    loadSlots();
  }, [jobId]);

  const loadSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `http://localhost:5000/api/interview-slots/job/${jobId}/available`
      );
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load available interview slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    setError('');

    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/${application._id}/book-slot`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ slotId: selected._id }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to confirm slot.');
        // If the slot was taken by another user (409), refresh the list.
        if (res.status === 409) {
          setSelected(null);
          await loadSlots();
        }
        return;
      }

      onBooked(data);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setConfirming(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Select Interview Slot</h2>
            <p className="text-indigo-100 mt-1">
              {application.jobId?.title || 'Interview Booking'}
            </p>
            <p className="text-indigo-200 text-sm">
              {application.jobId?.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-indigo-200 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Slot list */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-500">No available slots</p>
              <p className="text-sm mt-1">
                The company hasn&apos;t added any open slots yet. Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">
                Choose a time that works for you. Slots are locked immediately upon confirmation.
              </p>
              {slots.map((slot) => {
                const Icon = TYPE_ICON[slot.type] || MapPinIcon;
                const isSelected = selected?._id === slot._id;

                return (
                  <button
                    key={slot._id}
                    onClick={() => setSelected(slot)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {isSelected ? (
                          <CheckCircleIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        ) : (
                          <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {formatDate(slot.date)}
                          </p>
                          <p className="text-gray-600 text-sm flex items-center gap-1 mt-0.5">
                            <ClockIcon className="w-4 h-4" />
                            {slot.time} &middot; {slot.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                        <span>{TYPE_LABEL[slot.type] || slot.type}</span>
                      </div>
                    </div>

                    {/* Location / meeting link */}
                    {(slot.location || slot.meetingLink) && (
                      <p className="mt-2 text-xs text-gray-400 ml-8 truncate">
                        {slot.location || slot.meetingLink}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || confirming}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming ? 'Confirming…' : 'Confirm Slot'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSlotPicker;
