import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  BriefcaseIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  ArrowPathIcon,
  NoSymbolIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5000/api';

// â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PAYMENT_STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700'     },
};

const APP_STATUS = {
  pending:             { label: 'Pending',    cls: 'bg-blue-100 text-blue-700'    },
  reviewing:           { label: 'Reviewing',  cls: 'bg-blue-100 text-blue-700'   },
  accepted:            { label: 'Accepted',   cls: 'bg-teal-100 text-teal-700'    },
  interview_scheduled: { label: 'Scheduled',  cls: 'bg-blue-50 text-blue-800'   },
  rejected:            { label: 'Rejected',   cls: 'bg-red-100 text-red-700'      },
  withdrawn:           { label: 'Withdrawn',  cls: 'bg-gray-100 text-gray-500'    },
};

const FILTER_MAP = {
  all:       () => true,
  applied:   (a) => ['pending', 'reviewing', 'accepted'].includes(a.status),
  withdrawn: (a) => a.status === 'withdrawn',
  completed: (a) => ['interview_scheduled', 'rejected'].includes(a.status),
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

const fmtSlot = (date, time) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${time}`;
};

// â”€â”€ Shared UI components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const StatusBadge = ({ status }) => {
  const cfg = APP_STATUS[status] || APP_STATUS.pending;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const PayBadge = ({ status }) => {
  const cfg = PAYMENT_STATUS[status] || PAYMENT_STATUS.pending;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 truncate">{label}</p>
      {sub ? (
        <div className="text-sm mt-1 font-medium leading-snug text-gray-700">{sub}</div>
      ) : (
        <p className="text-3xl font-extrabold text-gray-800 mt-0.5">{value ?? 'â€”'}</p>
      )}
    </div>
  </div>
);

const Toast = ({ msg, type, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}
  >
    {msg}
    <button onClick={onClose} className="ml-1 opacity-80 hover:opacity-100">
      <XMarkIcon className="w-4 h-4" />
    </button>
  </div>
);

const ConfirmModal = ({ title, body, onConfirm, onCancel, confirming }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{body}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition disabled:opacity-60"
        >
          {confirming ? 'Savingâ€¦' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

// â”€â”€ Overview Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const OverviewPanel = ({ stats, applications, payments, slots, onNav }) => {
  const recentApps  = applications.slice(0, 5);
  const recentPays  = payments.slice(0, 5);
  const bookedSlots = slots.filter((s) => s.isBooked).slice(0, 4);
  const openSlots   = slots.filter((s) => !s.isBooked && s.status === 'available').slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<BriefcaseIcon className="w-8 h-8 text-blue-500" />}
          label="Total Applications"
          value={stats.total}
        />
        <StatCard
          icon={<UsersIcon className="w-8 h-8 text-blue-500" />}
          label="Active Applications"
          value={stats.active}
        />
        <StatCard
          icon={<CalendarDaysIcon className="w-8 h-8 text-blue-500" />}
          label="Interview Bookings"
          value={stats.interviewScheduled}
        />
        <StatCard
          icon={<BanknotesIcon className="w-8 h-8 text-blue-500" />}
          label="Payments"
          sub={
            <>
              <span className="text-amber-600 font-bold">Pending: {stats.paymentPending}</span>
              {'  '}
              <span className="text-green-700 font-bold">Completed: {stats.paymentCompleted}</span>
            </>
          }
        />
      </div>

      {/* 3-col summary grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Applications mini table */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <h2 className="text-base font-bold text-blue-600 mb-3">Recent Applications</h2>
          <table className="w-full text-sm flex-1">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">Student</th>
                <th className="pb-2 font-medium">Position</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">No applications yet.</td></tr>
              ) : recentApps.map((app) => (
                <tr key={app._id} className="border-b border-gray-50">
                  <td className="py-1.5 font-medium text-gray-800 max-w-[80px] truncate text-xs">
                    {app.studentId ? `${app.studentId.firstName} ${app.studentId.lastName}` : 'â€”'}
                  </td>
                  <td className="py-1.5 text-gray-600 max-w-[80px] truncate text-xs">{app.jobId?.title || 'â€”'}</td>
                  <td className="py-1.5"><StatusBadge status={app.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => onNav('applications')}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 self-start transition"
          >
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interview schedule mini */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <h2 className="text-base font-bold text-blue-600 mb-3">Interview Schedule</h2>
          {bookedSlots.length === 0 && openSlots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 flex-1">No interview slots yet.</p>
          ) : (
            <div className="space-y-2 flex-1">
              {bookedSlots.map((s) => (
                <div key={s._id} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.jobId?.title || 'Interview'}</p>
                      <p className="text-xs text-gray-500">{fmtSlot(s.date, s.time)}</p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    Booked
                  </span>
                </div>
              ))}
              {openSlots.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Open Slots</p>
                  {openSlots.map((s) => (
                    <div key={s._id} className="flex items-start gap-2 mb-1.5">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{s.jobId?.title || 'Open Slot'}</p>
                        <p className="text-xs text-gray-400">{fmtSlot(s.date, s.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => onNav('interviews')}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 self-start transition"
          >
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Payments mini table */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <h2 className="text-base font-bold text-blue-600 mb-3">Payment Records</h2>
          <table className="w-full text-sm flex-1">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">Student</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPays.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">No payments yet.</td></tr>
              ) : recentPays.map((p) => (
                <tr key={p._id} className="border-b border-gray-50">
                  <td className="py-1.5 font-medium text-gray-800 max-w-[80px] truncate text-xs">
                    {p.studentId ? `${p.studentId.firstName} ${p.studentId.lastName}` : 'â€”'}
                  </td>
                  <td className="py-1.5 text-xs text-gray-600">{p.amount > 0 ? `LKR ${p.amount.toLocaleString()}` : 'Sim.'}</td>
                  <td className="py-1.5"><PayBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => onNav('payments')}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 self-start transition"
          >
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Admin Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNav('applications')}
            className="px-5 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition"
          >
            Manage Applications
          </button>
          <button
            onClick={() => onNav('interviews')}
            className="px-5 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition"
          >
            Manage Interviews
          </button>
          <button
            onClick={() => onNav('payments')}
            className="px-5 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition flex items-center gap-1.5"
          >
            Manage Payments
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// â”€â”€ Applications Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ApplicationsPanel = ({ applications, search, onStatusUpdate }) => {
  const [filter, setFilter] = useState('all');
  const [actionApp, setActionApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [confirming, setConfirming] = useState(false);

  const displayed = applications
    .filter(FILTER_MAP[filter] || FILTER_MAP.all)
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const name = a.studentId
        ? `${a.studentId.firstName} ${a.studentId.lastName}`.toLowerCase()
        : '';
      return name.includes(q) || (a.jobId?.title || '').toLowerCase().includes(q);
    });

  const handleSelect = (app, status) => {
    setActionApp(app);
    setNewStatus(status);
  };

  const handleConfirm = async () => {
    if (!actionApp || !newStatus) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API}/applications/admin/${actionApp._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      onStatusUpdate(actionApp._id, newStatus, 'success');
    } catch (err) {
      onStatusUpdate(actionApp._id, newStatus, 'error', err.message);
    } finally {
      setConfirming(false);
      setActionApp(null);
      setNewStatus('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-blue-600">
          All Applications <span className="text-gray-400 font-normal text-sm">({displayed.length})</span>
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'applied', 'withdrawn', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                filter === f ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-2 pr-3 font-medium">#</th>
              <th className="pb-2 pr-3 font-medium">Student</th>
              <th className="pb-2 pr-3 font-medium">Email</th>
              <th className="pb-2 pr-3 font-medium">Position</th>
              <th className="pb-2 pr-3 font-medium">Company</th>
              <th className="pb-2 pr-3 font-medium">Status</th>
              <th className="pb-2 pr-3 font-medium">Date</th>
              <th className="pb-2 font-medium">Set Status</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  No applications found.
                </td>
              </tr>
            ) : displayed.map((app, i) => (
              <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="py-2.5 pr-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="py-2.5 pr-3 font-medium text-gray-800 whitespace-nowrap">
                  {app.studentId
                    ? `${app.studentId.firstName} ${app.studentId.lastName}`
                    : 'â€”'}
                </td>
                <td className="py-2.5 pr-3 text-gray-500 text-xs max-w-[140px] truncate">
                  {app.studentId?.email || 'â€”'}
                </td>
                <td className="py-2.5 pr-3 text-gray-700 max-w-[130px] truncate">
                  {app.jobId?.title || 'â€”'}
                </td>
                <td className="py-2.5 pr-3 text-gray-500 text-xs max-w-[110px] truncate">
                  {app.jobId?.companyName || 'â€”'}
                </td>
                <td className="py-2.5 pr-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="py-2.5 pr-3 text-gray-400 text-xs whitespace-nowrap">
                  {fmtDate(app.createdAt)}
                </td>
                <td className="py-2.5">
                  {!['withdrawn', 'rejected'].includes(app.status) ? (
                    <select
                      key={app._id + app.status}
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) handleSelect(app, e.target.value);
                      }}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="" disabled>Set statusâ€¦</option>
                      <option value="reviewing">â–º Reviewing</option>
                      <option value="accepted">âœ“ Accepted</option>
                      <option value="rejected">âœ— Rejected</option>
                    </select>
                  ) : (
                    <span className="text-xs text-gray-300">â€”</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {actionApp && (
        <ConfirmModal
          title="Update Application Status"
          body={`Set ${
            actionApp.studentId ? `${actionApp.studentId.firstName}'s` : 'this'
          } application to "${APP_STATUS[newStatus]?.label}"?`}
          onConfirm={handleConfirm}
          onCancel={() => { setActionApp(null); setNewStatus(''); }}
          confirming={confirming}
        />
      )}
    </div>
  );
};

// â”€â”€ Interviews Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const InterviewsPanel = ({ slots, search, onAction }) => {
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const match = (s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.jobId?.title || '').toLowerCase().includes(q) ||
      (s.jobId?.companyName || '').toLowerCase().includes(q)
    );
  };

  const booked    = slots.filter((s) => s.isBooked).filter(match);
  const available = slots.filter((s) => !s.isBooked && s.status === 'available').filter(match);

  const handleCancelConfirm = async () => {
    if (!confirmSlot) return;
    setConfirming(true);
    try {
      const appId = confirmSlot.bookedBy;
      if (!appId) throw new Error('No linked application found for this slot.');
      const res = await fetch(`${API}/applications/${appId}/cancel-interview`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Cancelled by admin.' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancellation failed');
      onAction('success', 'Interview cancelled. Slot is now available again.');
    } catch (err) {
      onAction('error', err.message);
    } finally {
      setConfirming(false);
      setConfirmSlot(null);
    }
  };

  const SlotTable = ({ rows, title, showAction }) => (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className={`text-base font-bold mb-4 ${showAction ? 'text-blue-600' : 'text-gray-600'}`}>
        {title} <span className="text-gray-400 font-normal text-sm">({rows.length})</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-2 pr-3 font-medium">#</th>
              <th className="pb-2 pr-3 font-medium">Job Position</th>
              <th className="pb-2 pr-3 font-medium">Company</th>
              <th className="pb-2 pr-3 font-medium">Date & Time</th>
              <th className="pb-2 pr-3 font-medium">Mode</th>
              <th className="pb-2 pr-3 font-medium">Status</th>
              {showAction && <th className="pb-2 font-medium">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showAction ? 7 : 6} className="py-10 text-center text-gray-400">
                  {showAction ? 'No booked interviews.' : 'No available slots.'}
                </td>
              </tr>
            ) : rows.map((s, i) => (
              <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="py-2.5 pr-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="py-2.5 pr-3 font-medium text-gray-800">{s.jobId?.title || 'â€”'}</td>
                <td className="py-2.5 pr-3 text-gray-500 text-xs">{s.jobId?.companyName || 'â€”'}</td>
                <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap text-xs">
                  {fmtSlot(s.date, s.time)}
                </td>
                <td className="py-2.5 pr-3">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {s.mode || 'N/A'}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  {showAction ? (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">Booked</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">Available</span>
                  )}
                </td>
                {showAction && (
                  <td className="py-2.5">
                    <button
                      onClick={() => setConfirmSlot(s)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                    >
                      <NoSymbolIcon className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <SlotTable rows={booked}    title="Booked Interviews" showAction={true}  />
      <SlotTable rows={available} title="Available Slots"   showAction={false} />

      {confirmSlot && (
        <ConfirmModal
          title="Cancel Interview?"
          body={`Cancel the booked interview for "${confirmSlot.jobId?.title || 'this job'}" on ${fmtSlot(confirmSlot.date, confirmSlot.time)}? The application will revert to "Accepted" and the slot will be freed.`}
          onConfirm={handleCancelConfirm}
          onCancel={() => setConfirmSlot(null)}
          confirming={confirming}
        />
      )}
    </div>
  );
};

// â”€â”€ Payments Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PaymentsPanel = ({ payments, search, onAction }) => {
  const [confirmPayment, setConfirmPayment] = useState(null);
  const [confirmType, setConfirmType] = useState(''); // 'cancel' | 'complete'
  const [confirming, setConfirming] = useState(false);

  const displayed = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = p.studentId
      ? `${p.studentId.firstName} ${p.studentId.lastName}`.toLowerCase()
      : '';
    return name.includes(q) || (p.jobId?.title || '').toLowerCase().includes(q);
  });

  const handleAction = async () => {
    if (!confirmPayment) return;
    setConfirming(true);
    try {
      const endpoint =
        confirmType === 'cancel'
          ? `${API}/payments/${confirmPayment._id}/cancel`
          : `${API}/payments/${confirmPayment._id}/complete`;
      const res = await fetch(endpoint, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      onAction('success', `Payment ${confirmType === 'cancel' ? 'cancelled' : 'marked as completed'} successfully.`);
    } catch (err) {
      onAction('error', err.message);
    } finally {
      setConfirming(false);
      setConfirmPayment(null);
      setConfirmType('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-bold text-blue-600 mb-4">
        All Payment Records <span className="text-gray-400 font-normal text-sm">({displayed.length})</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-2 pr-3 font-medium">#</th>
              <th className="pb-2 pr-3 font-medium">Student</th>
              <th className="pb-2 pr-3 font-medium">Position</th>
              <th className="pb-2 pr-3 font-medium">Amount</th>
              <th className="pb-2 pr-3 font-medium">Transaction Ref</th>
              <th className="pb-2 pr-3 font-medium">Status</th>
              <th className="pb-2 pr-3 font-medium">Date</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  No payment records found.
                </td>
              </tr>
            ) : displayed.map((p, i) => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="py-2.5 pr-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="py-2.5 pr-3 font-medium text-gray-800 whitespace-nowrap">
                  {p.studentId ? `${p.studentId.firstName} ${p.studentId.lastName}` : 'â€”'}
                </td>
                <td className="py-2.5 pr-3 text-gray-600 max-w-[130px] truncate">
                  {p.jobId?.title || 'â€”'}
                </td>
                <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap">
                  {p.amount > 0 ? `LKR ${p.amount.toLocaleString()}` : 'Simulated'}
                </td>
                <td className="py-2.5 pr-3 text-gray-400 text-xs font-mono">
                  {p.transactionRef ? p.transactionRef.slice(0, 12) + 'â€¦' : 'â€”'}
                </td>
                <td className="py-2.5 pr-3">
                  <PayBadge status={p.status} />
                </td>
                <td className="py-2.5 pr-3 text-gray-400 text-xs whitespace-nowrap">
                  {fmtDate(p.paidAt || p.createdAt)}
                </td>
                <td className="py-2.5">
                  {p.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setConfirmPayment(p); setConfirmType('complete'); }}
                        className="text-xs font-semibold text-green-600 hover:text-green-800 flex items-center gap-1 transition"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        Complete
                      </button>
                      <button
                        onClick={() => { setConfirmPayment(p); setConfirmType('cancel'); }}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                      >
                        <NoSymbolIcon className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">â€”</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmPayment && (
        <ConfirmModal
          title={confirmType === 'cancel' ? 'Cancel Payment?' : 'Mark as Completed?'}
          body={
            confirmType === 'cancel'
              ? `Cancel the payment for "${confirmPayment.jobId?.title || 'this job'}"? This cannot be undone.`
              : `Mark the payment for "${confirmPayment.jobId?.title || 'this job'}" as completed?`
          }
          onConfirm={handleAction}
          onCancel={() => { setConfirmPayment(null); setConfirmType(''); }}
          confirming={confirming}
        />
      )}
    </div>
  );
};

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ApplicationsDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats]               = useState({ total: 0, active: 0, interviewScheduled: 0, paymentPending: 0, paymentCompleted: 0 });
  const [applications, setApplications] = useState([]);
  const [payments, setPayments]         = useState([]);
  const [slots, setSlots]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeNav, setActiveNav]       = useState('overview');
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState(null); // { msg, type }

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, paymentsRes, slotsRes] = await Promise.all([
        fetch(`${API}/applications/admin/stats`),
        fetch(`${API}/applications/admin/all?limit=100`),
        fetch(`${API}/payments/admin/all?limit=100`),
        fetch(`${API}/interview-slots/admin/all?limit=100`),
      ]);
      if (statsRes.ok)    setStats(await statsRes.json());
      if (appsRes.ok)     setApplications(await appsRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (slotsRes.ok)    setSlots(await slotsRes.json());
    } catch {
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Called from ApplicationsPanel after status change
  const handleStatusUpdate = useCallback((appId, newStatus, result, errMsg) => {
    if (result === 'success') {
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      // Refresh stats counter
      fetch(`${API}/applications/admin/stats`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d) setStats(d); });
      showToast('Application status updated.', 'success');
    } else {
      showToast(errMsg || 'Failed to update status.', 'error');
    }
  }, [showToast]);

  // Called from InterviewsPanel / PaymentsPanel after any mutating action
  const handleAction = useCallback((type, msg) => {
    showToast(msg, type);
    if (type === 'success') loadAll();
  }, [showToast, loadAll]);

  const NAV = [
    { id: 'overview',      Icon: HomeIcon,                  label: 'Overview'      },
    { id: 'applications',  Icon: ClipboardDocumentListIcon, label: 'Applications'  },
    { id: 'interviews',    Icon: CalendarDaysIcon,          label: 'Interviews'    },
    { id: 'payments',      Icon: BanknotesIcon,             label: 'Payments'      },
  ];

  const PANEL_TITLE = {
    overview:     'Admin Dashboard',
    applications: 'Applications',
    interviews:   'Interview Schedule',
    payments:     'Payment Records',
  };

  const goNav = (id) => { setActiveNav(id); setSearch(''); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <aside className="w-16 bg-blue-900 flex flex-col items-center py-5 gap-1 flex-shrink-0">
        {/* Back to admin home */}
        <button
          onClick={() => navigate('/admin')}
          title="Back to Admin Home"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-300 hover:text-white hover:bg-blue-800 transition mb-3"
        >
          <ArrowRightIcon className="w-5 h-5 rotate-180" />
        </button>
        <div className="w-8 border-t border-blue-700 mb-2" />

        {NAV.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => goNav(id)}
            title={label}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
              activeNav === id
                ? 'bg-amber-500 text-white shadow-lg'
                : 'text-blue-300 hover:text-white hover:bg-blue-800'
            }`}
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}

        <div className="mt-auto flex flex-col gap-1">
          <button
            onClick={loadAll}
            title="Refresh data"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-300 hover:text-white hover:bg-blue-800 transition"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button
            title="Settings"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-300 hover:text-white hover:bg-blue-800 transition"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white px-8 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">{PANEL_TITLE[activeNav]}</h1>
          <div className="flex items-center gap-3">
            {/* Search â€” visible on non-overview panels */}
            {activeNav !== 'overview' && (
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Searchâ€¦"
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 w-52"
                />
              </div>
            )}
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
            >
              <UserCircleIcon className="w-7 h-7 text-gray-400" />
              <span>Admin</span>
            </button>
          </div>
        </header>

        {/* Panels */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800" />
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-6">
            {activeNav === 'overview' && (
              <OverviewPanel
                stats={stats}
                applications={applications}
                payments={payments}
                slots={slots}
                onNav={goNav}
              />
            )}
            {activeNav === 'applications' && (
              <ApplicationsPanel
                applications={applications}
                search={search}
                onStatusUpdate={handleStatusUpdate}
              />
            )}
            {activeNav === 'interviews' && (
              <InterviewsPanel
                slots={slots}
                search={search}
                onAction={handleAction}
              />
            )}
            {activeNav === 'payments' && (
              <PaymentsPanel
                payments={payments}
                search={search}
                onAction={handleAction}
              />
            )}
          </main>
        )}
      </div>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default ApplicationsDashboard;
