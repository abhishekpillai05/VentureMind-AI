import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const INDUSTRIES = [
  'Enterprise SaaS',
  'FinTech',
  'HealthTech & Bio',
  'Artificial Intelligence & ML',
  'E-Commerce & Retail',
  'EdTech',
  'CleanTech & Climate',
  'Agriculture / AgriTech',
  'Cybersecurity',
  'Logistics & Supply Chain',
  'Web3 & Crypto',
  'Other / Emerging',
];

const STAGES = [
  { value: 'Idea', label: 'Idea Stage (Conceptual)' },
  { value: 'Validation', label: 'Validation (Customer Discovery)' },
  { value: 'Prototype/MVP', label: 'Prototype / MVP' },
  { value: 'Early Traction', label: 'Early Traction (First Customers)' },
  { value: 'Scaling', label: 'Scaling & Growth' },
];

const REVENUE_MODELS = [
  'SaaS Subscription',
  'Marketplace Commission / Take Rate',
  'Usage-Based / Pay-as-you-go',
  'Freemium',
  'Enterprise Licensing & Support',
  'Hardware + Software Subscription',
  'Advertising & Data Insights',
  'Transactional / Service Fee',
];

export const StartupFormModal = ({ isOpen, onClose, onSubmit, initialData = null, title = 'Create New Startup' }) => {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    industry: 'Enterprise SaaS',
    stage: 'Idea',
    target_customer: '',
    problem_statement: '',
    solution_statement: '',
    revenue_model: 'SaaS Subscription',
    pitch_summary: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        tagline: initialData.tagline || '',
        industry: initialData.industry || 'Enterprise SaaS',
        stage: initialData.stage || 'Idea',
        target_customer: initialData.target_customer || '',
        problem_statement: initialData.problem_statement || '',
        solution_statement: initialData.solution_statement || '',
        revenue_model: initialData.revenue_model || 'SaaS Subscription',
        pitch_summary: initialData.pitch_summary || '',
      });
    } else {
      setFormData({
        name: '',
        tagline: '',
        industry: 'Enterprise SaaS',
        stage: 'Idea',
        target_customer: '',
        problem_statement: '',
        solution_statement: '',
        revenue_model: 'SaaS Subscription',
        pitch_summary: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side quick checks
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Startup name must be at least 2 characters long.');
      return;
    }
    if (!formData.target_customer.trim() || formData.target_customer.trim().length < 3) {
      setError('Please specify who your primary target customer is.');
      return;
    }
    if (!formData.problem_statement.trim() || formData.problem_statement.trim().length < 10) {
      setError('Problem statement must be at least 10 characters.');
      return;
    }
    if (!formData.solution_statement.trim() || formData.solution_statement.trim().length < 10) {
      setError('Solution statement must be at least 10 characters.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Startup submit error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save startup details. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Accurate details power our AI Validator, Market Analysis, and Investor Simulation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Startup Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Startup Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. AgriSense AI"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. AI-driven soil intelligence & irrigation"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Industry / Domain <span className="text-red-400">*</span>
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Development Stage <span className="text-red-400">*</span>
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {STAGES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Customer */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Customer Persona <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="target_customer"
              required
              value={formData.target_customer}
              onChange={handleChange}
              placeholder="e.g. Commercial vineyard & citrus farm operators managing 50+ acres"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Problem Statement */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Problem Statement <span className="text-red-400">*</span>
            </label>
            <textarea
              name="problem_statement"
              required
              rows={2}
              value={formData.problem_statement}
              onChange={handleChange}
              placeholder="What core pain point or bottleneck are your customers facing today?"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Solution Statement */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Solution Statement <span className="text-red-400">*</span>
            </label>
            <textarea
              name="solution_statement"
              required
              rows={2}
              value={formData.solution_statement}
              onChange={handleChange}
              placeholder="How does your product solve this problem uniquely or 10x better?"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Revenue Model */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Revenue Model
            </label>
            <select
              name="revenue_model"
              value={formData.revenue_model}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {REVENUE_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Pitch Summary */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Elevator Pitch Summary <span className="text-slate-500">(Optional)</span>
            </label>
            <textarea
              name="pitch_summary"
              rows={2}
              value={formData.pitch_summary}
              onChange={handleChange}
              placeholder="A 2-3 sentence elevator pitch describing the vision and opportunity."
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Startup</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartupFormModal;
