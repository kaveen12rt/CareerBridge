import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import InterviewSlotPicker from './InterviewSlotPicker';

// ── Status metadata ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:              { label: 'Pending',              bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  reviewing:            { label: 'Under Review',         bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300'   },
  accepted:             { label: 'Accepted',             bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300'  },
  interview_scheduled:  { label: 'Interview Scheduled',  bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300'   },
  rejected:             { label: 'Rejected',             bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300'    },
  withdrawn:            { label: 'Withdrawn',            bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-300'   },
};

const PAYMENT_CONFIG = {
  pending:   { label: 'Payment Pending',   bg: 'bg-yellow-50', text: 'text-yellow-700' },
  completed: { label: 'Payment Completed', bg: 'bg-green-50',  text: 'text-green-700'  },
  cancelled: { label: 'Payment Cancelled', bg: 'bg-gray-50',   text: 'text-gray-500'   },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const fmtDateTime = (date, time) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`;
};

// ── PaymentBadge ─────────────────────────────────────────────────────────────
const PaymentBadge = ({ applicationId }) => {
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/payments/application/${applicationId}`)
      .then((r) => r.json())
      .then((d) => { if (d && d.status) setPayment(d); })
      .catch(() => {});
  }, [applicationId]);

  if (!payment) return null;

  const cfg = PAYMENT_CONFIG[payment.status] || PAYMENT_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      <CurrencyDollarIcon className="w-3.5 h-3.5" />
      {cfg.label}
      {payment.transactionRef && (
        <span className="opacity-60 ml-1">· {payment.transactionRef}</span>
      )}
    </span>
  );
};

// ── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const MyApplications = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [slotPickerApp, setSlotPickerApp] = useState(null); // application shown in slot picker
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', msg }

  // ── Auth check ──────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check-auth', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data?.data?.user) {
          setCurrentUser(data.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // ── Load applications once authenticated ─────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    loadApplications();
  }, [currentUser]);

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/student/${currentUser.id}`
      );
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      showNotification('error', 'Failed to load applications.');
    } finally {
      setLoadingApps(false);
    }
  };

  const showNotification = (type, msg) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Withdraw application ─────────────────────────────────────────────────
  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This cannot be undone.')) return;
    setWithdrawingId(appId);
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/withdraw`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.message || 'Failed to withdraw application.');
        return;
      }
      // Refresh data
      await loadApplications();
      showNotification('success', 'Application withdrawn successfully.');
    } catch {
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  // ── Slot booking success ─────────────────────────────────────────────────
  const handleBooked = async (result) => {
    setSlotPickerApp(null);
    await loadApplications();
    showNotification(
      'success',
      `Interview confirmed! ${fmtDateTime(result.slot.date, result.slot.time)}.`
    );
  };

  // ── Loading / unauthenticated guards ─────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-4">Please sign in to view your applications.</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Active vs. closed split ───────────────────────────────────────────────
  const ACTIVE = ['pending', 'reviewing', 'accepted', 'interview_scheduled'];
  const active = applications.filter((a) => ACTIVE.includes(a.status));
  const closed = applications.filter((a) => !ACTIVE.includes(a.status));

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Notification toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <XCircleIcon className="w-5 h-5" />
          )}
          {notification.msg}
        </div>
      )}

      {/* Page header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/jobs')}
            className="mb-4 inline-flex items-center text-blue-200 hover:text-white font-medium text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
            Browse Jobs
          </button>
          <h1 className="text-3xl font-extrabold">My Applications</h1>
          <p className="text-blue-200 mt-1 text-sm">
            {active.length} active &middot; {closed.length} closed
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {loadingApps ? (
          <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BriefcaseIcon className="w-14 h-14 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-1">No applications yet</h3>
            <p className="text-gray-400 mb-6">Start applying to jobs to track your progress here.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
            >
              Find Jobs
            </button>
          </div>
        ) : (
          <>
            {/* ── Active applications ──────────────────────────────────── */}
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Active ({active.length} / 2 max)
                </h2>
                <div className="space-y-4">
                  {active.map((app) => (
                    <ApplicationCard
                      key={app._id}
                      app={app}
                      onWithdraw={handleWithdraw}
                      onBookSlot={() => setSlotPickerApp(app)}
                      withdrawingId={withdrawingId}
                      onPaymentUpdate={loadApplications}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Closed applications ──────────────────────────────────── */}
            {closed.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Closed
                </h2>
                <div className="space-y-4">
                  {closed.map((app) => (
                    <ApplicationCard
                      key={app._id}
                      app={app}
                      onWithdraw={handleWithdraw}
                      onBookSlot={() => setSlotPickerApp(app)}
                      withdrawingId={withdrawingId}
                      onPaymentUpdate={loadApplications}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Interview slot picker modal */}
      {slotPickerApp && (
        <InterviewSlotPicker
          application={slotPickerApp}
          onClose={() => setSlotPickerApp(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
};

// ── PaymentSection ───────────────────────────────────────────────────────────
const PaymentSection = ({ applicationId, onPaymentUpdate }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchPayment = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/payments/application/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.status) setPayment(data);
      }
    } catch {
      // payment may not exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayment(); }, [applicationId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch(`http://localhost:5000/api/payments/${payment._id}/complete`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        await fetchPayment();
        if (onPaymentUpdate) onPaymentUpdate();
      }
    } catch {
      // handled silently; badge will remain pending
    } finally {
      setPaying(false);
      setShowConfirm(false);
    }
  };

  if (loading || !payment) return null;

  const cfg = PAYMENT_CONFIG[payment.status] || PAYMENT_CONFIG.pending;

  return (
    <div className="mt-3">
      <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.text}`}>
        <CurrencyDollarIcon className="w-3.5 h-3.5" />
        {cfg.label}
        {payment.transactionRef && (
          <span className="opacity-60">· {payment.transactionRef.slice(0, 8)}</span>
        )}
      </div>

      {payment.status === 'pending' && (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            className="ml-2 px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
          >
            Pay Now
          </button>

          {showConfirm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Payment</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Confirm simulated payment for your interview booking?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition disabled:opacity-60"
                  >
                    {paying ? 'Processing…' : 'Confirm Payment'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Application card sub-component ──────────────────────────────────────────
const ApplicationCard = ({ app, onWithdraw, onBookSlot, withdrawingId, onPaymentUpdate }) => {
  const job = app.jobId || {};
  const slot = app.slotId;
  const ACTIVE = ['pending', 'reviewing', 'accepted', 'interview_scheduled'];
  const isActive = ACTIVE.includes(app.status);
  const isWithdrawing = withdrawingId === app._id;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900 truncate">{job.title || 'Untitled Job'}</h3>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-gray-600 font-medium">{job.companyName || '—'}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" /> {job.location}
              </span>
            )}
            {job.type && (
              <span className="flex items-center gap-1 capitalize">
                <BriefcaseIcon className="w-4 h-4" /> {job.type}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" /> Applied {fmtDate(app.createdAt)}
            </span>
          </div>

          {/* Interview slot info */}
          {slot && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="font-semibold text-blue-700 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Interview: {fmtDateTime(slot.date, slot.time)} &middot; {slot.duration} min
              </p>
              {(slot.location || slot.meetingLink) && (
                <p className="text-blue-500 mt-0.5 truncate">{slot.location || slot.meetingLink}</p>
              )}
            </div>
          )}

          {/* Payment section with Pay Now button */}
          {app.status === 'interview_scheduled' && (
            <PaymentSection applicationId={app._id} onPaymentUpdate={onPaymentUpdate} />
          )}

          {/* Cover letter snippet */}
          {app.coverLetter && (
            <p className="mt-2 text-sm text-gray-400 italic line-clamp-2">
              &ldquo;{app.coverLetter}&rdquo;
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Book Interview slot – available only when application is accepted */}
          {app.status === 'accepted' && (
            <button
              onClick={onBookSlot}
              className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Book Interview
            </button>
          )}

          {/* Withdraw – available for any active application */}
          {isActive && (
            <button
              onClick={() => onWithdraw(app._id)}
              disabled={isWithdrawing}
              className="px-4 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWithdrawing ? 'Withdrawing…' : 'Withdraw'}
            </button>
          )}

          {/* View job */}
          <a
            href={`/jobs/${job._id}`}
            className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            View Job
          </a>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
