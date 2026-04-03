import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { analyzeJobPostQuality } from './jobQualityAnalyzer';

const CompanyJobsReports = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/jobs');
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const report = useMemo(() => {
    const normalized = Array.isArray(jobs) ? jobs : [];
    const enriched = normalized.map((job) => ({
      ...job,
      qualityScore: analyzeJobPostQuality(job)?.score || 0,
    }));

    const totalJobs = enriched.length;
    const activeJobs = enriched.filter((job) => job.status === 'active').length;
    const averageQuality = totalJobs
      ? Math.round(enriched.reduce((sum, job) => sum + job.qualityScore, 0) / totalJobs)
      : 0;
    const needsImprovement = enriched.filter((job) => job.qualityScore < 70).length;
    const totalApplications = enriched.reduce(
      (sum, job) => sum + (Number(job.applicationsCount) || 0),
      0
    );

    const recentJobs = [...enriched]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);

    const topJobs = [...enriched]
      .sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0))
      .slice(0, 6);

    const lowResponseJobs = [...enriched]
      .sort((a, b) => (a.applicationsCount || 0) - (b.applicationsCount || 0))
      .slice(0, 6);

    const now = new Date();
    const soonThreshold = new Date();
    soonThreshold.setDate(soonThreshold.getDate() + 7);

    const expiringSoon = enriched
      .filter((job) => job.deadline)
      .filter((job) => {
        const deadline = new Date(job.deadline);
        return deadline >= now && deadline <= soonThreshold;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);

    return {
      totalJobs,
      activeJobs,
      averageQuality,
      needsImprovement,
      totalApplications,
      recentJobs,
      topJobs,
      lowResponseJobs,
      expiringSoon,
    };
  }, [jobs]);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'Title',
      'Company',
      'Location',
      'Type',
      'Status',
      'Quality Score',
      'Applications',
      'Posted Date',
      'Deadline',
    ];

    const rows = jobs.map((job) => [
      job.title || 'N/A',
      job.companyName || 'N/A',
      job.location || 'N/A',
      job.type || 'N/A',
      job.status || 'N/A',
      analyzeJobPostQuality(job)?.score || 0,
      job.applicationsCount || 0,
      formatDate(job.createdAt),
      formatDate(job.deadline),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'company-job-report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ label, value, icon }) => (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-5 company-card">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-900">{icon}</div>
        <div>
          <p className="text-xs uppercase text-slate-500 font-semibold">{label}</p>
          <p className="text-2xl font-bold text-blue-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const ReportTable = ({ title, items, emptyText }) => (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6 company-card print-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
        <span className="text-xs text-slate-500">{items.length} records</span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-slate-500">{emptyText}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-blue-700 bg-blue-50">
              <tr>
                <th className="px-3 py-2 font-semibold">Title</th>
                <th className="px-3 py-2 font-semibold">Company</th>
                <th className="px-3 py-2 font-semibold">Location</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Quality</th>
                <th className="px-3 py-2 font-semibold">Applications</th>
                <th className="px-3 py-2 font-semibold">Posted</th>
                <th className="px-3 py-2 font-semibold">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {items.map((job) => (
                <tr key={job._id || `${job.title}-${job.createdAt}`} className="border-b border-blue-50">
                  <td className="px-3 py-2 text-blue-900 font-medium">{job.title || 'N/A'}</td>
                  <td className="px-3 py-2 text-slate-600">{job.companyName || 'N/A'}</td>
                  <td className="px-3 py-2 text-slate-600">{job.location || 'N/A'}</td>
                  <td className="px-3 py-2 text-slate-600 capitalize">{job.type || 'N/A'}</td>
                  <td className="px-3 py-2 text-slate-600 capitalize">{job.status || 'N/A'}</td>
                  <td className="px-3 py-2 text-slate-600">{job.qualityScore ?? 0}</td>
                  <td className="px-3 py-2 text-slate-600">{job.applicationsCount || 0}</td>
                  <td className="px-3 py-2 text-slate-600">{formatDate(job.createdAt)}</td>
                  <td className="px-3 py-2 text-slate-600">{formatDate(job.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 company-fade-up">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Job Report Generator</h1>
            <p className="text-slate-600 mt-2">
              Structured insights from your Company Jobs data.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Generated on {formatDate(new Date())}
            </p>
          </div>
          <div className="flex gap-3 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-900 bg-white hover:bg-blue-50"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Report
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6 text-slate-500">
            Loading report data...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <StatCard label="Total Jobs" value={report.totalJobs} icon={<BriefcaseIcon className="w-5 h-5" />} />
              <StatCard label="Active Jobs" value={report.activeJobs} icon={<BriefcaseIcon className="w-5 h-5" />} />
              <StatCard label="Avg. Quality" value={`${report.averageQuality}/100`} icon={<BriefcaseIcon className="w-5 h-5" />} />
              <StatCard label="Needs Improvement" value={report.needsImprovement} icon={<ExclamationTriangleIcon className="w-5 h-5" />} />
              <StatCard label="Total Applications" value={report.totalApplications} icon={<BriefcaseIcon className="w-5 h-5" />} />
            </div>

            <ReportTable
              title="Recent Job Posts"
              items={report.recentJobs}
              emptyText="No jobs posted yet."
            />

            <ReportTable
              title="Top Performing Jobs"
              items={report.topJobs}
              emptyText="No jobs available."
            />

            <ReportTable
              title="Low Response Jobs"
              items={report.lowResponseJobs}
              emptyText="All jobs are receiving responses."
            />

            <ReportTable
              title="Jobs Expiring Soon"
              items={report.expiringSoon}
              emptyText="No jobs expiring in the next 7 days."
            />

            {report.needsImprovement > 0 && (
              <div className="bg-white rounded-2xl border border-orange-100 shadow-lg p-6 company-card">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-orange-600">Jobs That Need Improvement</p>
                    <p className="text-slate-600 text-sm">
                      {report.needsImprovement} job(s) are below the quality threshold.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyJobsReports;
