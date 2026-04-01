import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// ── Config ───────────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api';

const MODE_OPTIONS = [
  { value: 'in-person', label: 'In-Person',  Icon: MapPinIcon      },
  { value: 'video',     label: 'Video Call',  Icon: VideoCameraIcon  },
  { value: 'phone',     label: 'Phone Call',  Icon: PhoneIcon        },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const EMPTY_FORM = {
  date: '',
  time: '',
  duration: 30,
  type: 'in-person',
  location: '',
  meetingLink: '',
  notes: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

// Convert "HH:MM" to total minutes from midnight
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// Normalise a date string/object to "YYYY-MM-DD" in local time
const toLocalDateStr = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const Toast = ({ msg, type, onClose }) =>
  msg ? (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? (
        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
      ) : (
        <XCircleIcon className="w-5 h-5 flex-shrink-0" />
      )}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-80 hover:opacity-100 text-white font-bold">
        ×
      </button>
    </div>
  ) : null;

// ── Main Component ───────────────────────────────────────────────────────────
const InterviewSlotManagement = () => {
  const [jobs, setJobs]           = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load jobs on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/jobs`)
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load jobs.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  // Load slots when a job is selected
  useEffect(() => {
    if (!selectedJob) { setSlots([]); return; }
    loadSlots(selectedJob._id);
  }, [selectedJob]);

  const loadSlots = async (jobId) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(`${API}/interview-slots/job/${jobId}`);
      const data = await res.json();
      setSlots(Array.isArray(data) ? data.sort((a, b) => new Date(a.date) - new Date(b.date)) : []);
    } catch {
      showToast('Failed to load slots.', 'error');
    } finally {
      setSlotsLoading(false);
    }
  };

  // ── Form validation ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!selectedJob) e.job = 'Please select a job first.';
    if (!form.date)   e.date = 'Date is required.';
    else if (new Date(form.date) < new Date(new Date().toDateString()))
      e.date = 'Date cannot be in the past.';
    if (!form.time)   e.time = 'Time is required.';
    if (form.type === 'in-person' && !form.location.trim())
      e.location = 'Location is required for in-person interviews.';
    if (form.type === 'video' && !form.meetingLink.trim())
      e.meetingLink = 'Meeting link is required for video calls.';

    // ── Overlap check ─────────────────────────────────────────────────────
    // Ensure the new slot's entire window (start → start + duration) is free.
    if (form.date && form.time && !e.date && !e.time) {
      const newStart = timeToMinutes(form.time);
      const newEnd   = newStart + Number(form.duration);

      const conflict = slots.find((s) => {
        if (toLocalDateStr(s.date) !== form.date) return false;
        const sStart = timeToMinutes(s.time);
        const sEnd   = sStart + Number(s.duration);
        // Two intervals [a,b) and [c,d) overlap when a < d && c < b
        return newStart < sEnd && sStart < newEnd;
      });

      if (conflict) {
        const cStart = conflict.time;
        const cEndMin = timeToMinutes(conflict.time) + Number(conflict.duration);
        const cEnd = `${String(Math.floor(cEndMin / 60)).padStart(2, '0')}:${String(cEndMin % 60).padStart(2, '0')}`;
        e.time = `Overlaps with an existing slot (${cStart} – ${cEnd}). Choose a time that starts at ${cEnd} or later.`;
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        jobId: selectedJob._id,
        date: form.date,
        time: form.time,
        duration: Number(form.duration),
        type: form.type,
        location: form.type === 'in-person' ? form.location.trim() : undefined,
        meetingLink: form.type === 'video' ? form.meetingLink.trim() : undefined,
        notes: form.notes.trim() || undefined,
      };

      const res = await fetch(`${API}/interview-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create slot.');

      showToast('Interview slot created successfully.');
      setForm(EMPTY_FORM);
      setErrors({});
      setShowForm(false);
      await loadSlots(selectedJob._id);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Delete this interview slot? This cannot be undone.')) return;
    setDeletingId(slotId);
    try {
      const res = await fetch(`${API}/interview-slots/${slotId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to delete slot.');
      }
      showToast('Slot deleted.');
      setSlots((prev) => prev.filter((s) => s._id !== slotId));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => { const c = { ...er }; delete c[key]; return c; });
    },
  });

  // ── Render ───────────────────────────────────────────────────────────────
  const available = slots.filter((s) => !s.isBooked && s.status === 'available');
  const booked    = slots.filter((s) => s.isBooked);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Slots</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create and manage interview time slots for your job postings.
          </p>
        </div>

        {/* Job selector */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Job Posting
          </label>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading jobs…</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No jobs found. Post a job first from the company dashboard.
            </p>
          ) : (
            <div className="relative">
              <select
                value={selectedJob?._id || ''}
                onChange={(e) => {
                  const j = jobs.find((x) => x._id === e.target.value) || null;
                  setSelectedJob(j);
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setErrors({});
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">— Choose a job —</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} {j.companyName ? `· ${j.companyName}` : ''} ({j.status})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
          {errors.job && <p className="text-red-500 text-xs mt-1">{errors.job}</p>}
        </div>

        {/* Slots for selected job */}
        {selectedJob && (
          <>
            {/* Slot list header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Slots for&nbsp;
                <span className="text-blue-600">{selectedJob.title}</span>
                {slotsLoading && (
                  <ArrowPathIcon className="inline w-4 h-4 ml-2 animate-spin text-blue-400" />
                )}
              </h2>
              <button
                onClick={() => { setShowForm((v) => !v); setErrors({}); setForm(EMPTY_FORM); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                <PlusIcon className="w-4 h-4" />
                {showForm ? 'Cancel' : 'Add Slot'}
              </button>
            </div>

            {/* Add Slot form */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-100">
                <h3 className="text-base font-bold text-gray-800 mb-5">
                  New Interview Slot
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        {...field('date')}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        {...field('time')}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.time ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <select
                        {...field('duration')}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DURATION_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d} min</option>
                        ))}
                      </select>
                    </div>

                    {/* Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interview Mode <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        {MODE_OPTIONS.map(({ value, label, Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, type: value, location: '', meetingLink: '' }));
                              setErrors((er) => { const c = { ...er }; delete c.location; delete c.meetingLink; return c; });
                            }}
                            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-semibold transition ${
                              form.type === value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-500 hover:border-blue-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location (in-person) */}
                    {form.type === 'in-person' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPinIcon className="w-4 h-4 inline mr-1" />
                          Location / Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 2nd Floor, Head Office, Colombo 03"
                          {...field('location')}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                      </div>
                    )}

                    {/* Meeting link (video) */}
                    {form.type === 'video' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <VideoCameraIcon className="w-4 h-4 inline mr-1" />
                          Meeting Link <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/..."
                          {...field('meetingLink')}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.meetingLink ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        {errors.meetingLink && <p className="text-red-500 text-xs mt-1">{errors.meetingLink}</p>}
                      </div>
                    )}

                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any additional instructions for the candidate…"
                        {...field('notes')}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
                    >
                      {submitting ? 'Saving…' : 'Create Slot'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setErrors({}); setForm(EMPTY_FORM); }}
                      className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Slot tables */}
            {slotsLoading ? (
              <div className="flex justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <CalendarDaysIcon className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No slots created yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Click &quot;Add Slot&quot; above to create interview slots for this job.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Available slots */}
                {available.length > 0 && (
                  <SlotTable
                    title="Available Slots"
                    slots={available}
                    deletingId={deletingId}
                    onDelete={handleDelete}
                    showDelete
                    titleColor="text-green-700"
                    headerBg="bg-green-50"
                  />
                )}

                {/* Booked slots */}
                {booked.length > 0 && (
                  <SlotTable
                    title="Booked Slots"
                    slots={booked}
                    deletingId={deletingId}
                    onDelete={handleDelete}
                    showDelete={false}
                    titleColor="text-amber-700"
                    headerBg="bg-amber-50"
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Empty state when no job selected */}
        {!selectedJob && !loading && jobs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CalendarDaysIcon className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Select a job to manage its interview slots</p>
          </div>
        )}
      </div>

      <Toast
        msg={toast?.msg}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
};

// ── SlotTable sub-component ──────────────────────────────────────────────────
const SlotTable = ({ title, slots, deletingId, onDelete, showDelete, titleColor, headerBg }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className={`px-5 py-3 ${headerBg} border-b border-gray-100`}>
      <h3 className={`text-sm font-bold uppercase tracking-wide ${titleColor}`}>
        {title} ({slots.length})
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-2.5 font-medium">#</th>
            <th className="px-5 py-2.5 font-medium">Date</th>
            <th className="px-5 py-2.5 font-medium">Time</th>
            <th className="px-5 py-2.5 font-medium">Duration</th>
            <th className="px-5 py-2.5 font-medium">Mode</th>
            <th className="px-5 py-2.5 font-medium">Details</th>
            {showDelete && <th className="px-5 py-2.5 font-medium">Action</th>}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, i) => {
            const ModeIcon = {
              'in-person': MapPinIcon, video: VideoCameraIcon, phone: PhoneIcon,
            }[slot.type] || MapPinIcon;

            return (
              <tr key={slot._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {fmtDate(slot.date)}
                </td>
                <td className="px-5 py-3 text-gray-700 whitespace-nowrap">{slot.time}</td>
                <td className="px-5 py-3 text-gray-500">{slot.duration} min</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    <ModeIcon className="w-3.5 h-3.5" />
                    {{ 'in-person': 'In-Person', video: 'Video', phone: 'Phone' }[slot.type]}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                  {slot.location || slot.meetingLink || (slot.notes ? `Note: ${slot.notes}` : '—')}
                </td>
                {showDelete && (
                  <td className="px-5 py-3">
                    <button
                      onClick={() => onDelete(slot._id)}
                      disabled={deletingId === slot._id}
                      className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40 transition"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      {deletingId === slot._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default InterviewSlotManagement;
