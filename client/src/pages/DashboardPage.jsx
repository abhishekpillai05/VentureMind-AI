import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import startupService from '../services/startupService';
import StartupFormModal from '../components/startups/StartupFormModal';
import {
  Rocket,
  BrainCircuit,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  Target,
  FileText,
  Clock,
  Briefcase,
  AlertCircle,
  X,
  CheckCircle2,
  ChevronRight,
  Activity,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New startup modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/startups');
      if (res.data?.success) {
        setStartups(res.data.startups || []);
      }
    } catch (err) {
      console.error('Failed to load startups:', err);
      setError('Unable to load your startup workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  // Compute metrics from actual backend data
  const startupCount = startups.length;
  const validatedCount = startups.filter((s) => s.readiness_score !== null).length;
  const avgReadiness =
    startupCount > 0
      ? Math.round(
          startups.reduce((acc, s) => acc + (s.readiness_score || 0), 0) /
            (validatedCount || 1)
        )
      : null;

  const stageColorMap = {
    'Idea': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    'Validation': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    'Prototype/MVP': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    'Early Traction': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    'Scaling': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ─── WELCOME HEADER BANNER ─── */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0d1322]/90 via-[#090d16]/90 to-[#121b33]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Founder Workspace Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Founder'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Synthesize validation data, evaluate unit economics, and prepare your startup for investor pushback.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Create New Startup</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchStartups} className="text-xs underline hover:text-white font-medium">
            Retry
          </button>
        </div>
      )}

      {/* ─── 4 KPI GLASS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-indigo-500/30 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ventures</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{startupCount}</span>
            <span className="text-xs text-slate-400 font-medium">in workspace</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            {startupCount === 0 ? 'No ventures created yet' : `${startupCount} active pipeline projects`}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-cyan-500/30 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Validated Ideas</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400">{validatedCount}</span>
            <span className="text-xs text-slate-400 font-medium">of {startupCount} evaluated</span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${startupCount > 0 ? (validatedCount / startupCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {avgReadiness !== null && validatedCount > 0 ? `${avgReadiness}` : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-400/90 font-medium">
            {avgReadiness >= 75 ? 'Investor Ready (High)' : avgReadiness ? 'Moderate Validation' : 'Pending first evaluation'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-violet-500/30 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Intelligence</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-violet-300">Active</span>
            <span className="text-xs text-emerald-400 font-medium">● Online</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Gemini 2.0 Engine · Neon Cloud DB
          </div>
        </div>
      </div>

      {/* ─── SIMULATION & INTELLIGENCE DECK ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Co-Founder AI Simulators
          </h2>
          <span className="text-xs text-indigo-400 font-medium">6 Specialized Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Link
            to="/dashboard/validator"
            className="p-4 rounded-2xl bg-[#0d1322]/70 border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#131e36]/70 transition-all duration-200 group flex flex-col justify-between shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Idea Validator</p>
              <p className="text-[10px] text-slate-400 mt-0.5">SWOT & Viability</p>
            </div>
          </Link>

          <Link
            to="/dashboard/market-research"
            className="p-4 rounded-2xl bg-[#0d1322]/70 border border-white/[0.08] hover:border-cyan-500/40 hover:bg-[#131e36]/70 transition-all duration-200 group flex flex-col justify-between shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Market Intel</p>
              <p className="text-[10px] text-slate-400 mt-0.5">TAM / SAM / SOM</p>
            </div>
          </Link>

          <Link
            to="/dashboard/financial-simulator"
            className="p-4 rounded-2xl bg-[#0d1322]/70 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#131e36]/70 transition-all duration-200 group flex flex-col justify-between shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Financials</p>
              <p className="text-[10px] text-slate-400 mt-0.5">CAC vs LTV Curve</p>
            </div>
          </Link>

          <Link
            to="/dashboard/investor"
            className="p-4 rounded-2xl bg-[#0d1322]/70 border border-white/[0.08] hover:border-violet-500/40 hover:bg-[#131e36]/70 transition-all duration-200 group flex flex-col justify-between shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">Investor Room</p>
              <p className="text-[10px] text-slate-400 mt-0.5">AI VC Grilling</p>
            </div>
          </Link>

          <Link
            to="/dashboard/pitch-evaluation"
            className="p-4 rounded-2xl bg-[#0d1322]/70 border border-white/[0.08] hover:border-amber-500/40 hover:bg-[#131e36]/70 transition-all duration-200 group flex flex-col justify-between shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Pitch Coach</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Deck Diagnostics</p>
            </div>
          </Link>

          <Link
            to="/dashboard/reports"
            className="p-4 rounded-2xl bg-[#0d1322]/70 border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#131e36]/70 transition-all duration-200 group flex flex-col justify-between shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Reports</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Executive Export</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── STARTUP PROJECTS GRID ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Active Startup Ventures</span>
          </h2>
          {startups.length > 0 && (
            <Link
              to="/dashboard/startups"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>Manage all ({startups.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center bg-[#0d1322]/60 border border-white/[0.08] rounded-3xl backdrop-blur-xl">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">Accessing Neon Cloud Workspace...</p>
          </div>
        ) : startups.length === 0 ? (
          <div className="p-10 sm:p-14 text-center bg-[#0d1322]/70 border border-white/[0.08] rounded-3xl backdrop-blur-xl shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
              <Rocket className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No startups created yet</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 mb-6 leading-relaxed">
              Define your first venture to run AI idea validation, calculate total addressable market, model runway, and rehearse investor pitches.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Startup</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {startups.slice(0, 6).map((startup) => (
              <div
                key={startup.id}
                className="p-6 rounded-3xl bg-[#0d1322]/80 border border-white/[0.08] hover:border-indigo-500/40 backdrop-blur-xl shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Link
                      to={`/dashboard/startups/${startup.id}`}
                      className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate"
                    >
                      {startup.name}
                    </Link>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        stageColorMap[startup.stage] || 'bg-slate-800 text-slate-300 border-white/[0.08]'
                      }`}
                    >
                      {startup.stage || 'Idea'}
                    </span>
                  </div>

                  {startup.tagline ? (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {startup.tagline}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic mb-4">
                      {startup.target_customer ? `Targeting: ${startup.target_customer}` : 'No description provided'}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-white/[0.06] font-medium truncate max-w-[140px]">
                      {startup.industry}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-white/[0.06] font-medium truncate max-w-[140px]">
                      {startup.revenue_model}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Readiness:</span>
                    <span
                      className={`font-bold ${
                        startup.readiness_score ? 'text-indigo-400' : 'text-slate-500'
                      }`}
                    >
                      {startup.readiness_score ? `${startup.readiness_score}/100` : 'Not run'}
                    </span>
                  </div>

                  <Link
                    to={`/dashboard/validator/${startup.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Analyze</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── STARTUP FORM MODAL ─── */}
      <StartupFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await startupService.createStartup(data);
          await fetchStartups();
        }}
        title="Create New Startup"
      />
    </div>
  );
};
