import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── tiny stat card ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div className={`bg-white rounded-2xl border ${accent} p-5 shadow-sm`}>
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <p className="text-3xl font-black text-gray-900">{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

// ─── status pill ─────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending:   'bg-yellow-100 text-yellow-700',
    failed:    'bg-red-100 text-red-600',
    refunded:  'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default function JobMatchAdmin() {
  const navigate = useNavigate();

  // ── Premium purchases ──────────────────────────────────────────────────────
  const [purchases, setPurchases]     = useState([]);
  const [pLoading, setPLoading]       = useState(true);
  const [pError, setPError]           = useState('');

  // ── CV templates (all users) ───────────────────────────────────────────────
  const [cvStats, setCvStats]         = useState(null);
  const [cvLoading, setCvLoading]     = useState(true);

  // ── Match settings count ───────────────────────────────────────────────────
  const [matchCount, setMatchCount]   = useState(null);

  useEffect(() => {
    // Premium purchase history
    fetch('http://localhost:5000/api/job-match/premium/history', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setPurchases(Array.isArray(d?.purchases) ? d.purchases : []); })
      .catch(() => setPError('Failed to load purchase history.'))
      .finally(() => setPLoading(false));

    // CV template stats — reuse the admin-accessible endpoint
    // We call the history endpoint which returns all purchases; for CV count
    // we hit a lightweight aggregate via the existing route pattern.
    // Since there's no dedicated admin CV list endpoint, we derive stats from
    // the purchase data and show what's available.
    setCvLoading(false);
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const completedPurchases = purchases.filter(p => p.status === 'completed');
  const totalRevenue       = completedPurchases.reduce((s, p) => s + (p.amount || 0), 0);
  const todayCount         = completedPurchases.filter(p => {
    const d = new Date(p.completedAt || p.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth()    === now.getMonth()    &&
           d.getDate()     === now.getDate();
  }).length;

  const templateBreakdown = purchases.reduce((acc, p) => {
    acc[p.plan] = (acc[p.plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top nav ── */}
      <nav className="bg-blue-950 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-3 text-white">
          <span className="text-lg font-semibold">← Admin Portal</span>
        </Link>
        <span className="text-blue-200 text-sm font-medium">JobMatch Admin</span>
      </nav>

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 px-6 md:px-10 py-10 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                Member 3 · JobMatch
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3 leading-tight">
                JobMatch <span className="text-yellow-300">Admin Panel</span>
              </h1>
              <p className="text-indigo-200 mt-2 max-w-xl">
                Monitor CV generation activity, smart matching usage, and premium template purchases across all users.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/cv-generator"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20"
              >
                CV Generator ↗
              </Link>
              <Link
                to="/smart-matching"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20"
              >
                Smart Matching ↗
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-10">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Purchases"
            value={purchases.length}
            sub="All time"
            accent="border-indigo-200"
          />
          <StatCard
            label="Completed"
            value={completedPurchases.length}
            sub="Successful payments"
            accent="border-emerald-200"
          />
          <StatCard
            label="Revenue (LKR)"
            value={totalRevenue.toLocaleString()}
            sub="From premium templates"
            accent="border-yellow-200"
          />
          <StatCard
            label="Today"
            value={todayCount}
            sub="Purchases today"
            accent="border-violet-200"
          />
        </div>

        {/* ── Feature cards ── */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg mb-3">📄</div>
            <h3 className="font-bold text-gray-900 mb-1">CV Generator</h3>
            <p className="text-sm text-gray-500">Users can build CVs from 25 free templates and 5 premium designs. Supports PDF export and profile image upload.</p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">25 Free</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">5 Premium</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Max 10 saved</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg mb-3">🎯</div>
            <h3 className="font-bold text-gray-900 mb-1">Smart Matching</h3>
            <p className="text-sm text-gray-500">Ranks active jobs against a user's saved CV skills. Supports location, job type, and minimum score preferences.</p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Skill matching</span>
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Preferences</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-lg mb-3">★</div>
            <h3 className="font-bold text-gray-900 mb-1">Premium Templates</h3>
            <p className="text-sm text-gray-500">One-time LKR 1,499 purchase unlocks all 5 premium CV templates. Simulated card checkout with transaction tracking.</p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">LKR 1,499</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Lifetime access</span>
            </div>
          </div>
        </div>

        {/* ── Plan breakdown ── */}
        {Object.keys(templateBreakdown).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Purchase Plan Breakdown</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(templateBreakdown).map(([plan, count]) => (
                <div key={plan} className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                  <span className="text-2xl font-black text-indigo-700">{count}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{plan.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">purchases</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Premium purchase history table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Premium Purchase History</h2>
              <p className="text-sm text-gray-500 mt-0.5">All premium template transactions</p>
            </div>
            {pLoading && <span className="text-sm text-gray-400">Loading…</span>}
            {!pLoading && (
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {purchases.length} record{purchases.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {pError && (
            <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{pError}</div>
          )}

          {!pLoading && !pError && purchases.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-4xl mb-3">💳</p>
              <p className="text-gray-500 font-medium">No purchases yet</p>
              <p className="text-sm text-gray-400 mt-1">Premium template purchases will appear here.</p>
            </div>
          )}

          {!pLoading && !pError && purchases.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaction Ref</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cardholder</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Card</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-indigo-700 font-semibold">
                        {p.transactionRef || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-800 font-medium">
                        {p.cardHolder || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono">
                        {p.cardLast4 ? `•••• ${p.cardLast4}` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          {(p.plan || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {p.currency} {(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {p.completedAt
                          ? new Date(p.completedAt).toLocaleString()
                          : new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Revenue footer */}
          {completedPurchases.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{completedPurchases.length}</span> completed transaction{completedPurchases.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm font-bold text-indigo-700">
                Total Revenue: LKR {totalRevenue.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* ── Quick links ── */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">User-Facing Pages</h3>
            <div className="space-y-2">
              {[
                { label: 'CV Generator', path: '/cv-generator', desc: 'Build and download CVs' },
                { label: 'Saved CVs', path: '/cv-saved', desc: 'View all saved CV templates' },
                { label: 'Smart Matching', path: '/smart-matching', desc: 'Job matching by CV skills' },
                { label: 'Job Search', path: '/jobs', desc: 'Browse active job listings' },
              ].map(({ label, path, desc }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition group"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-indigo-500 text-lg">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">System Info</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'CV limit per user',       value: '10 CVs' },
                { label: 'Free templates',           value: '25 designs' },
                { label: 'Premium templates',        value: '5 designs' },
                { label: 'Premium price',            value: 'LKR 1,499 (one-time)' },
                { label: 'Profile image support',    value: 'JPG / PNG' },
                { label: 'PDF export',               value: 'All free + premium (if purchased)' },
                { label: 'Smart matching algorithm', value: 'Skills 50% · Location 30% · Type 20%' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <footer className="py-8 text-center text-gray-400 text-sm">
        © 2026 CareerBridge — JobMatch Admin
      </footer>
    </div>
  );
}
