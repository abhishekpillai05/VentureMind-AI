import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  BrainCircuit,
  Globe,
  BarChart3,
  Users,
  Target,
  FileCheck,
  CheckSquare,
  Square,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import startupService from '../../services/startupService';
import readinessService from '../../services/readinessService';

export const StartupReadinessPage = () => {
  const { startupId: paramStartupId } = useParams();
  const navigate = useNavigate();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(paramStartupId || '');
  const [loadingStartups, setLoadingStartups] = useState(true);

  const [readinessData, setReadinessData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  // 1. Fetch startups
  useEffect(() => {
    const loadStartups = async () => {
      try {
        setLoadingStartups(true);
        const res = await startupService.getAllStartups();
        if (res?.success) {
          const list = res.startups || [];
          setStartups(list);
          if (paramStartupId) {
            setSelectedStartupId(paramStartupId);
          } else if (list.length > 0) {
            setSelectedStartupId(String(list[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load startups:', err);
      } finally {
        setLoadingStartups(false);
      }
    };
    loadStartups();
  }, [paramStartupId]);

  // 2. Load readiness score
  useEffect(() => {
    if (!selectedStartupId) return;

    const loadReadiness = async () => {
      try {
        setLoadingData(true);
        const res = await readinessService.getReadiness(selectedStartupId);
        if (res?.success) {
          setReadinessData(res);
        }
      } catch (err) {
        console.error('Failed to fetch readiness score:', err);
      } finally {
        setLoadingData(false);
      }
    };
    loadReadiness();
  }, [selectedStartupId]);

  const selectedStartup = startups.find((s) => String(s.id) === String(selectedStartupId));
  const readiness = readinessData?.readiness || {};
  const modules = readiness.modules || [];
  const checklist = readinessData?.actionChecklist || [];

  const radarData = modules.map((m) => ({
    subject: m.name,
    score: m.completed ? m.score : 0,
    fullMark: 100,
  }));

  const getModuleIcon = (key) => {
    switch (key) {
      case 'validation':
        return BrainCircuit;
      case 'market':
        return Globe;
      case 'financial':
        return BarChart3;
      case 'investor':
        return Users;
      case 'pitch':
        return Target;
      default:
        return Sparkles;
    }
  };

  const getModuleRoute = (key, startupId) => {
    switch (key) {
      case 'validation':
        return `/dashboard/validator/${startupId}`;
      case 'market':
        return `/dashboard/market-research/${startupId}`;
      case 'financial':
        return `/dashboard/financial-simulator/${startupId}`;
      case 'investor':
        return `/dashboard/investor/${startupId}`;
      case 'pitch':
        return `/dashboard/pitch-evaluation/${startupId}`;
      default:
        return `/dashboard`;
    }
  };

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Module 5 • Composite Diagnostic
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3 mt-1.5">
            <Award className="w-6 h-6 text-emerald-400" />
            Startup Readiness Score & Index
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Holistic cross-module assessment synthesizing Idea Validation (25%), Market (20%), Financial (20%), Investor (15%), and Pitch (20%).
          </p>
        </div>

        {startups.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedStartupId}
              onChange={(e) => {
                setSelectedStartupId(e.target.value);
                navigate(`/dashboard/readiness/${e.target.value}`);
              }}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.industry})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingData ? (
        <div className="p-12 flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Calculating startup readiness index...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ─── OVERALL READINESS SCORE BANNER ─── */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Score circle */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-950 border-4 border-emerald-500/30 flex items-center justify-center text-center flex-shrink-0">
                  <div>
                    <span className="text-3xl font-black text-white">{readiness.overallScore || 0}</span>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      / 100
                    </span>
                  </div>
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    {readiness.stageLabel || 'Early Stage'}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2">
                    {selectedStartup?.name} Readiness Index
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                    {readiness.formulaExplanation || 'Deterministic multi-module readiness index.'}
                  </p>
                </div>
              </div>

              {/* Completion Progress */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2 lg:min-w-[280px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Simulation Progress:</span>
                  <span className="font-bold text-white">
                    {readiness.completedCount || 0} of {readiness.totalCount || 5} Complete
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${readiness.completionPercentage || 0}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500 block text-right">
                  {readiness.completionPercentage || 0}% completed
                </span>
              </div>
            </div>
          </div>

          {/* ─── RADAR & STRENGTHS/WEAKNESSES ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  5-Dimension Pentagon Radar
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visual readiness spread across each simulation pillar.
                </p>
              </div>

              <div className="h-64 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[10px] text-slate-500 text-center">
                Missing modules are pro-rated and do not artificially drag scores to zero.
              </div>
            </div>

            {/* Pillar Breakdown Cards (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Component Module Diagnostics:
              </h3>
              <div className="space-y-2.5">
                {modules.map((m) => {
                  const Icon = getModuleIcon(m.key);
                  const route = getModuleRoute(m.key, selectedStartupId);

                  return (
                    <div
                      key={m.key}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            m.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              (Weight: {Math.round(m.baseWeight * 100)}%)
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {m.completed ? `Score: ${m.score} / 100` : 'Not run yet'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.completed
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {m.completed ? 'Complete' : 'Pending'}
                        </span>
                        <Link
                          to={route}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                        >
                          <span>{m.completed ? 'View' : 'Run'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── ACTION CHECKLIST ─── */}
          {checklist.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Priority Founder Action Checklist
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recommended steps to elevate your startup readiness into the 90+ venture-ready tier.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {checklist.map((item, idx) => {
                  const isChecked = !!checkedItems[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BOTTOM BANNER: EXPORT PDF */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Generate Investor-Ready PDF Dossier</h3>
              <p className="text-xs text-slate-400 mt-1">
                Compile all validated insights, addressable market models, financial curves, and investor feedback into an executive PDF.
              </p>
            </div>
            <Link
              to={`/dashboard/reports/${selectedStartupId}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <span>Export PDF Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupReadinessPage;
