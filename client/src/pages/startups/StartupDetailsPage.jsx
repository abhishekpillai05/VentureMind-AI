import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Rocket,
  BrainCircuit,
  Edit3,
  Trash2,
  ArrowLeft,
  Calendar,
  Layers,
  Users,
  AlertCircle,
  TrendingUp,
  Sparkles,
  IndianRupee,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import startupService from '../../services/startupService';
import StartupFormModal from '../../components/startups/StartupFormModal';

export const StartupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchStartupDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await startupService.getStartupById(id);
      if (res?.success) {
        setStartup(res.startup);
      }
    } catch (err) {
      console.error('Failed to fetch startup:', err);
      setError('Startup not found or you do not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartupDetails();
  }, [id]);

  const handleUpdateStartup = async (formData) => {
    await startupService.updateStartup(id, formData);
    await fetchStartupDetails();
  };

  const handleDeleteStartup = async () => {
    try {
      setDeleting(true);
      setDeleteError(null);
      await startupService.deleteStartup(id);
      navigate('/dashboard/startups');
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete startup.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading startup profile...</p>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{error || 'Startup could not be found.'}</span>
        </div>
        <Link
          to="/dashboard/startups"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Startup Portfolio</span>
        </Link>
      </div>
    );
  }

  const score = startup.latest_validation_score ?? startup.readiness_score;
  const verdict = startup.latest_validation_verdict;
  const isScoreAvailable = score !== null && score !== undefined;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* ─── BREADCRUMB & ACTIONS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <Link
          to="/dashboard/startups"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Startups</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Startup</span>
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* ─── HERO CARD ─── */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                {startup.industry}
              </span>
              <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">
                Stage: {startup.stage}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {new Date(startup.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {startup.name}
            </h1>
            {startup.tagline && (
              <p className="text-base text-slate-300 italic">"{startup.tagline}"</p>
            )}
          </div>

          {/* Validation Status & Action Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 lg:min-w-[340px] justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                AI Validation Status
              </div>
              {isScoreAvailable ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-emerald-400">{score}/100</span>
                    <span className="text-xs text-slate-300 font-medium">Readiness</span>
                  </div>
                  {verdict && (
                    <div className="text-xs text-indigo-300 font-medium mt-0.5">{verdict}</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400">No evaluation report generated yet.</div>
              )}
            </div>

            <Link
              to={`/dashboard/validator/${startup.id}`}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{isScoreAvailable ? 'View / Re-Validate' : 'Validate Idea'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 8 CORE PARAMETERS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Problem Statement */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Problem Statement</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {startup.problem_statement}
          </p>
        </div>

        {/* 2. Solution Statement */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Solution Statement</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {startup.solution_statement}
          </p>
        </div>

        {/* 3. Target Customer Persona */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <Users className="w-4 h-4" />
            <span>Target Customer Persona</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {startup.target_customer}
          </p>
        </div>

        {/* 4. Revenue & Monetization Model */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <IndianRupee className="w-4 h-4" />
            <span>Monetization Model</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {startup.revenue_model || 'SaaS Subscription'}
          </p>
        </div>
      </div>

      {/* 5. Pitch Summary */}
      {startup.pitch_summary && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <FileText className="w-4 h-4" />
            <span>Elevator Pitch Summary</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {startup.pitch_summary}
          </p>
        </div>
      )}

      {/* ─── QUICK NAVIGATION TO OTHER MODULES ─── */}
      <div className="pt-4 border-t border-slate-800/60">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Simulation Modules for {startup.name}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to={`/dashboard/validator/${startup.id}`}
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-indigo-300">
                AI Idea Validator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluate problem-solution fit, SWOT matrix, and viability scores.
            </p>
          </Link>

          <Link
            to="/dashboard/market"
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-sky-300">
                Market Research
              </span>
            </div>
            <p className="text-xs text-slate-400">
              TAM / SAM / SOM market estimation and competitor benchmarking.
            </p>
          </Link>

          <Link
            to="/dashboard/investors"
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-amber-300">
                AI Investor Room
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pitch your startup live to virtual VCs, Angels, and Growth investors.
            </p>
          </Link>
        </div>
      </div>

      {/* Edit Modal */}
      <StartupFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateStartup}
        initialData={startup}
        title="Edit Startup Profile"
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Delete {startup.name}?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this startup profile? All associated validation
              history and readiness scores will be permanently removed.
            </p>

            {deleteError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteStartup}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Startup</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupDetailsPage;
