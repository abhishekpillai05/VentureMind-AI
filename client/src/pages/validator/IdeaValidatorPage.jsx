import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Rocket,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldAlert,
  ArrowRight,
  Loader2,
  RefreshCw,
  Compass,
  CheckSquare,
  Square,
  BarChart2,
  ChevronDown,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import startupService from '../../services/startupService';
import validatorService from '../../services/validatorService';

export const IdeaValidatorPage = () => {
  const { startupId: paramStartupId } = useParams();
  const navigate = useNavigate();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(paramStartupId || '');
  const [loadingStartups, setLoadingStartups] = useState(true);

  // Validation data states
  const [activeValidation, setActiveValidation] = useState(null);
  const [validationHistory, setValidationHistory] = useState([]);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState(null);

  // Active analysis tab
  const [activeTab, setActiveTab] = useState('swot'); // 'swot', 'dimensions', 'risks', 'recommendations'
  // Local checklist state for founder tracking
  const [checkedItems, setCheckedItems] = useState({});

  const analysisMilestones = [
    'Parsing startup profile & customer value proposition...',
    'Evaluating Problem-Solution fit & target audience alignment...',
    'Benchmarking against competitive landscape & defensibility...',
    'Synthesizing SWOT matrix, risk mitigation & action roadmap...',
  ];

  // 1. Fetch startups for the selector
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
        setError('Failed to load your startups. Please try again.');
      } finally {
        setLoadingStartups(false);
      }
    };

    loadStartups();
  }, [paramStartupId]);

  // 2. Fetch validation for the selected startup
  useEffect(() => {
    if (!selectedStartupId) return;

    const loadValidationData = async () => {
      try {
        setLoadingValidation(true);
        setError(null);

        // Fetch latest validation & history in parallel
        const [latestRes, historyRes] = await Promise.all([
          validatorService.getLatestValidation(selectedStartupId).catch(() => null),
          validatorService.getValidationHistory(selectedStartupId).catch(() => null),
        ]);

        if (latestRes?.validation) {
          setActiveValidation(latestRes.validation);
        } else {
          setActiveValidation(null);
        }

        if (historyRes?.history) {
          setValidationHistory(historyRes.history);
        } else {
          setValidationHistory([]);
        }
      } catch (err) {
        console.error('Error loading validation data:', err);
      } finally {
        setLoadingValidation(false);
      }
    };

    loadValidationData();
  }, [selectedStartupId]);

  // Handle Startup selection change
  const handleStartupChange = (e) => {
    const newId = e.target.value;
    setSelectedStartupId(newId);
    navigate(`/dashboard/validator/${newId}`);
  };

  // Run AI Validation
  const handleRunValidation = async () => {
    if (!selectedStartupId) return;

    setAnalyzing(true);
    setError(null);
    setAnalysisStep(0);

    // Step cycle animation
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < analysisMilestones.length - 1 ? prev + 1 : prev));
    }, 2200);

    try {
      const res = await validatorService.analyzeStartupIdea(selectedStartupId);
      if (res?.success && res.validation) {
        setActiveValidation(res.validation);
        // Refresh history
        const histRes = await validatorService.getValidationHistory(selectedStartupId);
        if (histRes?.history) {
          setValidationHistory(histRes.history);
        }
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(
        err.response?.data?.message ||
          'AI validation encountered an unexpected issue. Please retry in a moment.'
      );
    } finally {
      clearInterval(stepInterval);
      setAnalyzing(false);
    }
  };

  // Switch to an older validation from history
  const handleSelectHistoricalRun = async (validationId) => {
    try {
      setLoadingValidation(true);
      const res = await validatorService.getValidationById(selectedStartupId, validationId);
      if (res?.validation) {
        setActiveValidation(res.validation);
      }
    } catch (err) {
      console.error('Error switching history:', err);
    } finally {
      setLoadingValidation(false);
    }
  };

  const selectedStartup = startups.find((s) => String(s.id) === String(selectedStartupId));

  // Extract report components safely
  const report = activeValidation?.full_report || {};
  const scores = report.scores || activeValidation?.dimension_scores || {};
  const overallScore = activeValidation?.overall_score ?? report.overallScore ?? 0;
  const verdict = activeValidation?.verdict ?? report.verdict ?? 'Needs Evaluation';
  const swot = report.swot || activeValidation?.swot_analysis || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };
  const risks = report.keyRisks || [];
  const recommendations = report.recommendations || [];
  const nextSteps = report.nextSteps || [];

  // Chart data for Radar
  const radarData = [
    { dimension: 'Problem Fit', score: scores.problemSolutionFit || 0, fullMark: 100 },
    { dimension: 'Audience', score: scores.targetAudience || 0, fullMark: 100 },
    { dimension: 'Market Opp.', score: scores.marketOpportunity || 0, fullMark: 100 },
    { dimension: 'Competition', score: scores.competition || 0, fullMark: 100 },
    { dimension: 'Business Model', score: scores.businessModel || 0, fullMark: 100 },
    { dimension: 'Feasibility', score: scores.feasibility || 0, fullMark: 100 },
  ];

  const getVerdictStyle = (v) => {
    const text = v?.toLowerCase() || '';
    if (text.includes('strong') || text.includes('high') || text.includes('promising')) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        badge: 'bg-emerald-500 text-slate-950 font-bold',
      };
    }
    if (text.includes('pivot') || text.includes('refinement') || text.includes('moderate')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        badge: 'bg-amber-500 text-slate-950 font-bold',
      };
    }
    return {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      badge: 'bg-rose-500 text-white font-bold',
    };
  };

  const verdictStyle = getVerdictStyle(verdict);

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER & CONTROLS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              Module 3 • Phase 2
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3 mt-1.5">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            AI Startup Idea Validator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multi-dimensional viability scoring, automated SWOT analysis, and actionable pivot recommendations.
          </p>
        </div>

        {/* Startup Selector & Analyze CTA */}
        {startups.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedStartupId}
              onChange={handleStartupChange}
              disabled={analyzing}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.industry})
                </option>
              ))}
            </select>

            <button
              onClick={handleRunValidation}
              disabled={analyzing}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Idea...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{activeValidation ? 'Re-Validate Idea' : 'Run AI Validation'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── EMPTY STATE: NO STARTUPS ─── */}
      {!loadingStartups && startups.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Startups Found</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            You need to create a startup profile first before running the AI Idea Validator.
          </p>
          <Link
            to="/dashboard/startups"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <span>Create a Startup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : analyzing ? (
        /* ─── LIVE AI ANALYSIS PROGRESS STATE ─── */
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-12 text-center max-w-2xl mx-auto my-8 space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              Evaluating "{selectedStartup?.name || 'Startup Concept'}"
            </h3>
            <p className="text-sm text-indigo-300 font-medium animate-pulse">
              {analysisMilestones[analysisStep]}
            </p>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden max-w-md mx-auto">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 transition-all duration-700 ease-out"
              style={{ width: `${((analysisStep + 1) / analysisMilestones.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500">
            Powered by Gemini AI • Assessing 9 analytical startup dimensions
          </p>
        </div>
      ) : loadingValidation ? (
        /* ─── LOADING EXISTING RECORD ─── */
        <div className="p-12 flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading validation report...</p>
        </div>
      ) : !activeValidation ? (
        /* ─── EMPTY STATE: NOT VALIDATED YET ─── */
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-6 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              "{selectedStartup?.name}" Has Not Been Validated Yet
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Run our AI evaluation engine to uncover market viability, analyze SWOT factors,
              and receive an objective investor readiness benchmark.
            </p>
          </div>
          <button
            onClick={handleRunValidation}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Run AI Validation Now</span>
          </button>
        </div>
      ) : (
        /* ─── COMPLETE VALIDATION REPORT DISPLAY ─── */
        <div className="space-y-8">
          {/* TOP BANNER: SCORE + VERDICT + HISTORICAL SWITCHER */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Score & Verdict Info */}
              <div className="flex items-center gap-6">
                {/* Radial / Circle Score Indicator */}
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-950 border-4 border-indigo-500/30 flex-shrink-0">
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">{overallScore}</span>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      / 100
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${verdictStyle.bg}`}>
                      Verdict: {verdict}
                    </span>
                    <span className="text-xs text-slate-500">
                      Evaluated on {new Date(activeValidation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedStartup?.name} Validation Report
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {report.executiveSummary || 'Comprehensive startup viability and risk assessment.'}
                  </p>
                </div>
              </div>

              {/* History Switcher */}
              {validationHistory.length > 1 && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                  <History className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">History:</span>
                  <select
                    value={activeValidation.id}
                    onChange={(e) => handleSelectHistoricalRun(Number(e.target.value))}
                    className="bg-transparent text-white font-medium focus:outline-none"
                  >
                    {validationHistory.map((h, i) => (
                      <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                        Run #{validationHistory.length - i} (Score: {h.overall_score}/100) —{' '}
                        {new Date(h.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ─── RADAR CHART & 6 DIMENSION METRICS ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recharts Radar Visualization */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Dimension Radar Benchmark
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual strength across 6 critical founder evaluation dimensions.
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.45}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center text-[11px] text-slate-500">
                A balanced polygon indicates strong foundational readiness.
              </div>
            </div>

            {/* Right: Dimension Progress Bars */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Detailed Dimension Scores
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown by category with individual weight and progress.
                </p>
              </div>

              <div className="space-y-4 my-4">
                {radarData.map((d) => {
                  const getBarColor = (val) => {
                    if (val >= 75) return 'bg-emerald-500';
                    if (val >= 55) return 'bg-amber-500';
                    return 'bg-rose-500';
                  };

                  return (
                    <div key={d.dimension} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{d.dimension}</span>
                        <span className="font-bold text-white">{d.score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getBarColor(
                            d.score
                          )}`}
                          style={{ width: `${d.score}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Strong (75-100)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Needs Refinement (55-74)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> High Risk (0-54)
                </span>
              </div>
            </div>
          </div>

          {/* ─── NAVIGATION TABS FOR DEEP ANALYSIS ─── */}
          <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
            {[
              { id: 'swot', label: 'SWOT Analysis Matrix' },
              { id: 'dimensions', label: 'Dimension Breakdown' },
              { id: 'risks', label: 'Risks & Mitigations' },
              { id: 'recommendations', label: 'Next Steps Checklist' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-300 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── TAB CONTENT 1: SWOT MATRIX ─── */}
          {activeTab === 'swot' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Internal Advantage
                  </span>
                </div>
                <ul className="space-y-2">
                  {swot.strengths?.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {(!swot.strengths || swot.strengths.length === 0) && (
                    <li className="text-xs text-slate-500 italic">No strengths identified.</li>
                  )}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Weaknesses
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">
                    Internal Gap
                  </span>
                </div>
                <ul className="space-y-2">
                  {swot.weaknesses?.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {(!swot.weaknesses || swot.weaknesses.length === 0) && (
                    <li className="text-xs text-slate-500 italic">No weaknesses identified.</li>
                  )}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Opportunities
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-sky-500/80 bg-sky-500/10 px-2 py-0.5 rounded">
                    External Growth
                  </span>
                </div>
                <ul className="space-y-2">
                  {swot.opportunities?.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {(!swot.opportunities || swot.opportunities.length === 0) && (
                    <li className="text-xs text-slate-500 italic">No opportunities identified.</li>
                  )}
                </ul>
              </div>

              {/* Threats */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Threats
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-rose-500/80 bg-rose-500/10 px-2 py-0.5 rounded">
                    External Hazard
                  </span>
                </div>
                <ul className="space-y-2">
                  {swot.threats?.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {(!swot.threats || swot.threats.length === 0) && (
                    <li className="text-xs text-slate-500 italic">No threats identified.</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* ─── TAB CONTENT 2: DIMENSION DEEP DIVES ─── */}
          {activeTab === 'dimensions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem Solution Fit */}
              {report.problemSolutionAnalysis && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Problem-Solution Fit</span>
                    <span className="text-xs font-semibold text-indigo-400">
                      {scores.problemSolutionFit}/100
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.problemSolutionAnalysis.explanation}
                  </p>
                  {report.problemSolutionAnalysis.improvementTip && (
                    <div className="mt-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                      <span className="font-semibold">Recommendation: </span>
                      {report.problemSolutionAnalysis.improvementTip}
                    </div>
                  )}
                </div>
              )}

              {/* Target Audience */}
              {report.targetAudienceAnalysis && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Target Audience Persona</span>
                    <span className="text-xs font-semibold text-indigo-400">
                      {scores.targetAudience}/100
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.targetAudienceAnalysis.personaFit}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Customer Urgency: </span>
                    {report.targetAudienceAnalysis.urgency}
                  </p>
                </div>
              )}

              {/* Market Opportunity */}
              {report.marketOpportunityAnalysis && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Market Opportunity & Timing</span>
                    <span className="text-xs font-semibold text-indigo-400">
                      {scores.marketOpportunity}/100
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.marketOpportunityAnalysis.sizeCommentary}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Tailwinds: </span>
                    {report.marketOpportunityAnalysis.tailwinds}
                  </p>
                </div>
              )}

              {/* Competitive Landscape */}
              {report.competitiveLandscape && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Competitive Moat</span>
                    <span className="text-xs font-semibold text-indigo-400">
                      {scores.competition}/100
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.competitiveLandscape.moatAssessment}
                  </p>
                  {report.competitiveLandscape.directCompetitors?.length > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      <span className="text-slate-300 font-medium">Key Competitors: </span>
                      {report.competitiveLandscape.directCompetitors.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Business Model */}
              {report.businessModelAnalysis && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Business Model & Pricing</span>
                    <span className="text-xs font-semibold text-indigo-400">
                      {scores.businessModel}/100
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.businessModelAnalysis.monetizationViability}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Scalability: </span>
                    {report.businessModelAnalysis.scalability}
                  </p>
                </div>
              )}

              {/* Technical Feasibility */}
              {report.feasibilityAnalysis && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Technical & Operational Feasibility</span>
                    <span className="text-xs font-semibold text-indigo-400">
                      {scores.feasibility}/100
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.feasibilityAnalysis.technicalBarriers}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Time to MVP: </span>
                    {report.feasibilityAnalysis.estimatedTimeToMVP}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB CONTENT 3: RISKS & MITIGATIONS ─── */}
          {activeTab === 'risks' && (
            <div className="space-y-4">
              {risks.map((r, idx) => {
                const getRiskBadge = (sev) => {
                  const s = sev?.toLowerCase() || '';
                  if (s === 'high') return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
                  if (s === 'medium') return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
                  return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
                };

                return (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-white">{r.risk}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getRiskBadge(
                          r.severity
                        )}`}
                      >
                        {r.severity} Severity
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-300 font-medium">Category: </span>
                      {r.category}
                    </div>
                    <div className="pt-2 text-xs text-emerald-300 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <span className="font-semibold text-emerald-400">Recommended Mitigation: </span>
                      {r.mitigation}
                    </div>
                  </div>
                );
              })}
              {risks.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-xl">
                  No critical risks recorded in this validation run.
                </div>
              )}
            </div>
          )}

          {/* ─── TAB CONTENT 4: RECOMMENDATIONS & NEXT STEPS ─── */}
          {activeTab === 'recommendations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strategic Recommendations */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Strategic AI Recommendations
                </h4>
                <ul className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Checklist */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Founder Action Checklist
                </h4>
                <p className="text-xs text-slate-400">
                  Track your progress as you address validation gaps:
                </p>
                <div className="space-y-2.5 pt-1">
                  {nextSteps.map((step, idx) => {
                    const isChecked = !!checkedItems[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(idx)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM BANNER: NEXT MODULE CTA */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Ready to take {selectedStartup?.name} to virtual investors?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simulate an investor pitch session with AI VCs calibrated to your startup's readiness score.
              </p>
            </div>
            <Link
              to="/dashboard/investors"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <span>Go to Investor Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaValidatorPage;
