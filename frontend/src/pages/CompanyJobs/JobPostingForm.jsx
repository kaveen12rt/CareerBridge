import { useEffect, useMemo, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { analyzeJobPostQuality } from './jobQualityAnalyzer';

const JobPostingForm = ({ embedded = false, initialValues = {}, onPosted, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyImage: '',
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: [''],
    skills: [''],
    experience: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const qualityAnalysis = useMemo(() => analyzeJobPostQuality(formData), [formData]);

  useEffect(() => {
    if (initialValues && typeof initialValues === 'object') {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  const getQualityTheme = (score) => {
    if (score >= 85) {
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }

    if (score >= 70) {
      return 'bg-blue-50 border-blue-200 text-blue-700';
    }

    if (score >= 50) {
      return 'bg-amber-50 border-amber-200 text-amber-700';
    }

    return 'bg-rose-50 border-rose-200 text-rose-700';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          companyImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index, field) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (qualityAnalysis.criticalIssues.length > 0) {
      alert(`Please fix these issues before publishing:\n- ${qualityAnalysis.criticalIssues.join('\n- ')}`);
      return;
    }

    if (qualityAnalysis.score < 70) {
      const shouldContinue = confirm(
        `Job quality score is ${qualityAnalysis.score}/100 (${qualityAnalysis.tier}). Continue with publishing?`
      );

      if (!shouldContinue) {
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const created = await response.json().catch(() => null);
        if (!embedded) {
          alert('Job posted successfully!');
        }
        setFormData({
          companyName: initialValues?.companyName || '',
          companyImage: initialValues?.companyImage || '',
          title: '',
          department: '',
          location: '',
          type: 'full-time',
          salaryMin: '',
          salaryMax: '',
          description: '',
          requirements: [''],
          skills: [''],
          experience: '',
          deadline: ''
        });
        if (typeof onPosted === 'function') {
          onPosted(created);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        const message = data?.message || 'Failed to post job. Please try again.';
        if (embedded) {
          setSubmitError(message);
        } else {
          alert(message);
        }
      }
    } catch (error) {
      console.error('Error posting job:', error);
      const message = 'Error posting job. Please try again.';
      if (embedded) {
        setSubmitError(message);
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const containerClassName = embedded
    ? 'bg-white'
    : 'min-h-screen bg-slate-50 py-6';

  const innerClassName = embedded
    ? 'w-full'
    : 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <div className={containerClassName}>
      <div className={innerClassName}>
        <div className="bg-white shadow-lg border border-blue-100 rounded-2xl company-card company-fade-up">
          <div className="px-6 py-4 border-b border-blue-100">
            <h1 className="text-2xl font-bold text-blue-900">Post a New Job</h1>
            <p className="text-slate-600 mt-1">Fill in the details to create a job posting</p>
          </div>

          {embedded && typeof onClose === 'function' ? (
            <div className="px-6 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                ← Back to jobs
              </button>
            </div>
          ) : null}

          {submitError ? (
            <div className="px-6 pt-5">
              <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                {submitError}
              </div>
            </div>
          ) : null}

          <div className="px-6 pt-6">
            <div className={`border rounded-lg p-4 ${getQualityTheme(qualityAnalysis.score)}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">AI Job Post Quality Analyzer</h2>
                  <p className="text-sm opacity-90">Score updates live as you complete the vacancy details.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Quality Score</p>
                  <p className="text-3xl font-bold">{qualityAnalysis.score}/100</p>
                  <p className="text-xs font-semibold uppercase tracking-wide">{qualityAnalysis.tier}</p>
                </div>
              </div>

              {qualityAnalysis.warnings.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">Warnings</p>
                  <ul className="mt-1 text-sm list-disc list-inside space-y-1">
                    {qualityAnalysis.warnings.slice(0, 4).map((warning, index) => (
                      <li key={`${warning}-${index}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {qualityAnalysis.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold">Suggestions</p>
                  <ul className="mt-1 text-sm list-disc list-inside space-y-1">
                    {qualityAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={`${suggestion}-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CareerBridge"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Software Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range (Min)
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range (Max)
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="80000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Required
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2-4 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.companyImage && (
                  <div className="mt-2">
                    <img src={formData.companyImage} alt="Company Preview" className="h-20 w-20 object-cover rounded-md" />
                  </div>
                )}
              </div>

            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the job role and responsibilities..."
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a requirement..."
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'requirements')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('requirements')}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a skill..."
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'skills')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('skills')}
                  className="flex items-center text-blue-900 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Skill
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-blue-100">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;