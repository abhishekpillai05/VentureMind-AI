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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER / WELCOME ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Founder'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your startup validation progress and prepare for investor pitches.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Startup</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchStartups} className="text-xs underline hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* ─── REAL METRICS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">My Startups</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{startupCount}</span>
            <span className="text-xs text-slate-500">active {startupCount === 1 ? 'project' : 'projects'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Validated Ideas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{validatedCount}</span>
            <span className="text-xs text-slate-500">of {startupCount} evaluated</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {avgReadiness !== null && validatedCount > 0 ? `${avgReadiness}/100` : '—'}
            </span>
            <span className="text-xs text-slate-500">
              {validatedCount > 0 ? 'score' : 'no validations yet'}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Overall Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {avgReadiness !== null ? `${avgReadiness}/100` : '—'}
            </span>
            <span className="text-xs text-slate-500">portfolio index</span>
          </div>
        </div>
      </div>

      {/* ─── QUICK ACTIONS (ALL 6 MODULES) ─── */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Simulation & Intelligence Modules
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/dashboard/validator"
            className="flex flex-col p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">Idea Validator</p>
            <p className="text-[10px] text-slate-400 mt-0.5">SWOT & viability</p>
          </Link>

          <Link
            to="/dashboard/market-research"
            className="flex flex-col p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">Market Intel</p>
            <p className="text-[10px] text-slate-400 mt-0.5">TAM/SAM/SOM</p>
          </Link>

          <Link
            to="/dashboard/financial-simulator"
            className="flex flex-col p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">Financials</p>
            <p className="text-[10px] text-slate-400 mt-0.5">CAC vs LTV curve</p>
          </Link>

          <Link
            to="/dashboard/investor"
            className="flex flex-col p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">Investor Room</p>
            <p className="text-[10px] text-slate-400 mt-0.5">AI VC grilling</p>
          </Link>

          <Link
            to="/dashboard/pitch-evaluation"
            className="flex flex-col p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">Pitch Coach</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Story diagnostics</p>
          </Link>

          <Link
            to="/dashboard/reports"
            className="flex flex-col p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">PDF Dossier</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Executive export</p>
          </Link>
        </div>
      </div>

      {/* ─── RECENT STARTUP PROJECTS (REAL BACKEND DATA OR CLEAN EMPTY STATE) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400" />
            Recent Startup Projects
          </h2>
          {startups.length > 0 && (
            <Link
              to="/dashboard/startups"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center bg-slate-900/30 border border-slate-800/60 rounded-2xl">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Loading your startup workspace...</p>
          </div>
        ) : startups.length === 0 ? (
          <div className="p-10 text-center bg-slate-900/30 border border-slate-800/60 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No startups created yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 mb-5 leading-relaxed">
              Create your first startup profile to begin validating your business assumptions,
              analyzing market competitors, and simulating revenue models.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Your First Startup
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {startups.slice(0, 6).map((startup) => (
              <div
                key={startup.id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      to={`/dashboard/startups/${startup.id}`}
                      className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate"
                    >
                      {startup.name}
                    </Link>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium whitespace-nowrap">
                      {startup.stage || 'Idea'}
                    </span>
                  </div>
                  {startup.tagline && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {startup.tagline}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 truncate max-w-[140px]">
                      {startup.industry}
                    </span>
                    <span>•</span>
                    <span className="truncate">{startup.revenue_model}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Readiness:</span>
                    <span
                      className={`font-semibold ${
                        startup.readiness_score ? 'text-indigo-400' : 'text-slate-500'
                      }`}
                    >
                      {startup.readiness_score ? `${startup.readiness_score}/100` : 'Not evaluated'}
                    </span>
                  </div>
                  <Link
                    to={`/dashboard/validator/${startup.id}`}
                    className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium flex items-center gap-1"
                  >
                    <span>Validate</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── STARTUP ACTIVITY ─── */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Startup Activity
        </h2>
        {startups.length === 0 ? (
          <div className="p-6 text-center bg-slate-900/30 border border-slate-800/60 rounded-xl">
            <p className="text-xs text-slate-500">No activity recorded yet. Start by creating a project above.</p>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl divide-y divide-slate-800/60">
            {startups.slice(0, 4).map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-medium text-white">{s.name}</span>
                    <span className="text-slate-400 ml-1.5">registered in workspace</span>
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODAL: NEW STARTUP ─── */}
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
