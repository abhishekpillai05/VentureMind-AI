import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Target,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  BarChart2,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Clock,
  History,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import startupService from '../../services/startupService';
import pitchService from '../../services/pitchService';

export const PitchEvaluationPage = () => {
  const { startupId: paramStartupId } = useParams();
  const navigate = useNavigate();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(paramStartupId || '');
  const [loadingStartups, setLoadingStartups] = useState(true);

  // Form states
  const [pitchText, setPitchText] = useState('');
  const [duration, setDuration] = useState(3);
  const [evaluating, setEvaluating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Result & history states
  const [activeEvaluation, setActiveEvaluation] = useState(null);
  const [history, setHistory] = useState([]);

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

  // 2. Load latest evaluation & history for startup
  useEffect(() => {
    if (!selectedStartupId) return;

    const loadData = async () => {
      try {
        const [latestRes, histRes] = await Promise.all([
          pitchService.getLatestPitch(selectedStartupId).catch(() => null),
          pitchService.getPitchHistory(selectedStartupId).catch(() => null),
        ]);

        if (latestRes?.evaluation) {
          setActiveEvaluation(latestRes.evaluation);
          if (latestRes.evaluation.pitch_transcript) {
            setPitchText(latestRes.evaluation.pitch_transcript);
          }
        } else {
          setActiveEvaluation(null);
        }

        if (histRes?.history) {
          setHistory(histRes.history);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error loading pitch evaluation data:', err);
      }
    };
    loadData();
  }, [selectedStartupId]);

  const selectedStartup = startups.find((s) => String(s.id) === String(selectedStartupId));

  // Quick sample pitch filler
  const handleLoadSamplePitch = () => {
    if (!selectedStartup) return;
    setPitchText(
      `Hello investors, I'm the founder of ${selectedStartup.name}. Today, ${selectedStartup.problem_statement} We solve this directly: ${selectedStartup.solution_statement} Our core customers are ${selectedStartup.target_customer}. We monetize through ${selectedStartup.revenue_model}. We are looking to scale our initial validation and invite you to join us on this mission.`
    );
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selectedStartupId || !pitchText.trim()) return;

    try {
      setEvaluating(true);
      setError(null);
      const res = await pitchService.evaluatePitch(selectedStartupId, pitchText.trim(), duration);
      if (res?.success && res.evaluation) {
        setActiveEvaluation({
          ...res.evaluation,
          pitch_transcript: pitchText.trim(),
        });
        const histRes = await pitchService.getPitchHistory(selectedStartupId);
        if (histRes?.history) setHistory(histRes.history);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Pitch evaluation failed. Please check inputs.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleCopyImproved = () => {
    const text = activeEvaluation?.improved_pitch || activeEvaluation?.improvedPitch;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scores = activeEvaluation?.category_scores || activeEvaluation?.categoryScores || {};
  const radarData = [
    { subject: 'Problem', score: scores.problemClarity || 0, fullMark: 100 },
    { subject: 'Solution', score: scores.solutionEffectiveness || 0, fullMark: 100 },
    { subject: 'Audience', score: scores.targetMarketUnderstanding || 0, fullMark: 100 },
    { subject: 'Market', score: scores.marketOpportunity || 0, fullMark: 100 },
    { subject: 'Model', score: scores.businessModel || 0, fullMark: 100 },
    { subject: 'Moat', score: scores.competitiveAdvantage || 0, fullMark: 100 },
    { subject: 'Structure', score: scores.clarityAndStructure || 0, fullMark: 100 },
    { subject: 'Appeal', score: scores.investorAppeal || 0, fullMark: 100 },
  ];

  const overallScore = activeEvaluation?.overall_score || activeEvaluation?.overallScore || 0;
  const strengths = activeEvaluation?.pitch_strengths || activeEvaluation?.strengths || [];
  const weaknesses = activeEvaluation?.pitch_weaknesses || activeEvaluation?.weaknesses || [];
  const missing = activeEvaluation?.missing_information || activeEvaluation?.missingInformation || [];
  const questions = activeEvaluation?.actionable_feedback?.potentialInvestorQuestions || activeEvaluation?.potentialInvestorQuestions || [];
  const improvedPitch = activeEvaluation?.improved_pitch || activeEvaluation?.improvedPitch;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-400" />
            AI Pitch Deck & Script Evaluation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            10-criteria investor scoring, storytelling structure diagnostics, and authentic AI pitch rewrites.
          </p>
        </div>

        {startups.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedStartupId}
              onChange={(e) => {
                setSelectedStartupId(e.target.value);
                setActiveEvaluation(null);
              }}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
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

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── PITCH INPUT SUBMISSION FORM ─── */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Submit Your Pitch Transcript or Elevator Script
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste your verbal pitch script or slide transcript to receive category scores and structural improvements.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadSamplePitch}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline self-start sm:self-auto"
          >
            Auto-fill sample from startup profile
          </button>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="relative">
            <textarea
              rows={5}
              required
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Paste your 60-second elevator pitch or 3-minute pitch deck narrative here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 leading-relaxed outline-none resize-none"
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-slate-500">
              {pitchText.length} characters
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Duration:</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white text-xs"
              >
                <option value={1}>1-Minute Elevator Pitch</option>
                <option value={3}>3-Minute Lightning Pitch</option>
                <option value={5}>5-Minute Investor Demo</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={evaluating || pitchText.trim().length < 30}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              {evaluating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Pitch Narrative...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate Pitch with AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── EVALUATION RESULTS DISPLAY ─── */}
      {activeEvaluation && (
        <div className="space-y-8">
          {/* Top Score Banner */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-950 border-4 border-indigo-500/30 flex items-center justify-center text-center flex-shrink-0">
                  <div>
                    <span className="text-2xl font-black text-white">{overallScore}</span>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      / 100
                    </span>
                  </div>
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    Verdict: {activeEvaluation.verdict || 'Evaluated'}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    Pitch Appeal Diagnostic for {selectedStartup?.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Scored across 10 core dimensions based on clarity, investor appeal, and storytelling flow.
                  </p>
                </div>
              </div>

              {history.length > 1 && (
                <div className="text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Submissions: {history.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── RADAR & CATEGORY GRID ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  10-Axis Pitch Balance
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visual radar reflecting investor persuasive strength.
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
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <span className="text-[10px] text-center text-slate-500">
                Balances clarity, TAM defensibility, and delivery cadence.
              </span>
            </div>

            {/* Strengths & Weaknesses (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Pitch Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Areas to Sharpen
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Information */}
              {missing.length > 0 && (
                <div className="sm:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Missing Critical Venture Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {missing.map((m, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── IMPROVED PITCH REWRITE ─── */}
          {improvedPitch && (
            <div className="bg-slate-900/60 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI-Optimized Pitch Script (Preserving Founder Facts)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Restructured for maximum hook, narrative pacing, and punchy value proposition.
                  </p>
                </div>
                <button
                  onClick={handleCopyImproved}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {improvedPitch}
              </div>
            </div>
          )}

          {/* ─── PROBING QUESTIONS TRIGGERED BY PITCH ─── */}
          {questions.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Anticipate These Tough Investor Questions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed italic"
                  >
                    "{q}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PitchEvaluationPage;
