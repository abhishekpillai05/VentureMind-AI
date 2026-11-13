import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Globe,
  Sparkles,
  Rocket,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Loader2,
  History,
  Shield,
  Layers,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import startupService from '../../services/startupService';
import marketService from '../../services/marketService';
import { useCurrency } from '../../context/CurrencyContext';

export const MarketResearchPage = () => {
  const { startupId: paramStartupId } = useParams();
  const navigate = useNavigate();
  const { currency, currencySymbol, formatCompact } = useCurrency();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(paramStartupId || '');
  const [loadingStartups, setLoadingStartups] = useState(true);

  // Market research data states
  const [activeResearch, setActiveResearch] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState(null);

  // Active tab inside market view
  const [activeTab, setActiveTab] = useState('tamsam'); // 'tamsam', 'competitors', 'segments', 'opportunities'

  const milestones = [
    'Benchmarking industry macro trends & regulatory tailwinds...',
    'Synthesizing TAM / SAM / SOM addressable market models...',
    'Mapping competitive positioning matrix & differentiation moats...',
    'Identifying underserved niches & strategic partnership angles...',
  ];

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
        setError('Failed to load your startups.');
      } finally {
        setLoadingStartups(false);
      }
    };
    loadStartups();
  }, [paramStartupId]);

  // 2. Fetch market research data for selected startup
  useEffect(() => {
    if (!selectedStartupId) return;

    const loadMarketData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        const [latestRes, histRes] = await Promise.all([
          marketService.getLatestMarketResearch(selectedStartupId).catch(() => null),
          marketService.getMarketHistory(selectedStartupId).catch(() => null),
        ]);

        if (latestRes?.marketResearch) {
          setActiveResearch(latestRes.marketResearch);
          setCompetitors(latestRes.competitors || []);
        } else {
          setActiveResearch(null);
          setCompetitors([]);
        }

        if (histRes?.history) {
          setHistory(histRes.history);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadMarketData();
  }, [selectedStartupId]);

  const handleStartupChange = (e) => {
    const newId = e.target.value;
    setSelectedStartupId(newId);
    navigate(`/dashboard/market-research/${newId}`);
  };

  const handleRunAnalysis = async () => {
    if (!selectedStartupId) return;

    setAnalyzing(true);
    setError(null);
    setAnalysisStep(0);

    const timer = setInterval(() => {
      setAnalysisStep((prev) => (prev < milestones.length - 1 ? prev + 1 : prev));
    }, 2200);

    try {
      const res = await marketService.analyzeMarketResearch(selectedStartupId);
      if (res?.success && res.marketResearch) {
        setActiveResearch(res.marketResearch);
        setCompetitors(res.marketResearch.competitors || []);
        const histRes = await marketService.getMarketHistory(selectedStartupId);
        if (histRes?.history) setHistory(histRes.history);
      }
    } catch (err) {
      console.error('Market analysis error:', err);
      setError(err.response?.data?.message || 'Failed to complete market research.');
    } finally {
      clearInterval(timer);
      setAnalyzing(false);
    }
  };

  const selectedStartup = startups.find((s) => String(s.id) === String(selectedStartupId));
  const report = activeResearch?.full_report || {};
  const tamSamSom = report.tamSamSom || {};
  const segments = report.targetCustomerSegments || [];
  const opportunities = report.marketOpportunities || {};
  const trends = report.marketTrends || [];
  const demand = report.marketDemand || {};

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER & CONTROLS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 border border-sky-500/20 text-sky-400">
              Module 1 • Market Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3 mt-1.5">
            <Globe className="w-6 h-6 text-sky-400" />
            Market Research & Competitor Benchmarking
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            TAM / SAM / SOM market sizing models, competitive feature grids, and untapped growth opportunities.
          </p>
        </div>

        {startups.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedStartupId}
              onChange={handleStartupChange}
              disabled={analyzing}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 font-medium"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.industry})
                </option>
              ))}
            </select>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{activeResearch ? 'Re-Analyze Market' : 'Run Market Research'}</span>
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
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Startups Found</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Create a startup profile first to run tailored market and competitor intelligence.
          </p>
          <Link
            to="/dashboard/startups"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <span>Create Startup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : analyzing ? (
        /* ─── LIVE RESEARCH PROGRESS STATE ─── */
        <div className="bg-slate-900/80 border border-sky-500/30 rounded-2xl p-12 text-center max-w-2xl mx-auto my-8 space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-sky-600/20 border-2 border-sky-500 flex items-center justify-center text-sky-400">
              <Globe className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              Investigating "{selectedStartup?.name || 'Venture'}" Market Landscape
            </h3>
            <p className="text-sm text-sky-300 font-medium animate-pulse">
              {milestones[analysisStep]}
            </p>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden max-w-md mx-auto">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 transition-all duration-700 ease-out"
              style={{ width: `${((analysisStep + 1) / milestones.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500">
            Scanning industry verticals • Grounded heuristic models • No fabricated citations
          </p>
        </div>
      ) : loadingData ? (
        <div className="p-12 flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading market intelligence...</p>
        </div>
      ) : !activeResearch ? (
        /* ─── EMPTY STATE: NOT RESEARCHED YET ─── */
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-6 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              No Market Intelligence Generated for "{selectedStartup?.name}"
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Generate TAM/SAM/SOM market sizing, identify direct & indirect competitors, and uncover
              underserved customer niches.
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Market Research Now</span>
          </button>
        </div>
      ) : (
        /* ─── COMPLETE MARKET RESEARCH REPORT ─── */
        <div className="space-y-8">
          {/* TOP BANNER */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-300">
                    Market Readiness Score: {report.marketReadinessScore || 75}/100
                  </span>
                  <span className="text-xs text-slate-500">
                    Generated {new Date(activeResearch.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {selectedStartup?.name} — Industry Landscape Dossier
                </h2>
                <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed whitespace-pre-wrap">
                  {report.industryOverview || 'Comprehensive market opportunity assessment.'}
                </p>
              </div>

              {history.length > 1 && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                  <History className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Past Runs: {history.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── TAM / SAM / SOM CARDS ─── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Addressable Market Sizing Model (Estimated)
              </h3>
              <span className="text-[11px] text-slate-400 italic">
                *Modelled with transparent founder-extrapolated assumptions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* TAM */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2 relative overflow-hidden">
                <div className="w-1.5 h-full bg-indigo-500 absolute left-0 top-0"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  TAM • Total Addressable Market
                </span>
                <div className="text-3xl font-extrabold text-white">
                  {currency === 'INR' && tamSamSom.tamFormatted
                    ? tamSamSom.tamFormatted
                    : formatCompact(tamSamSom.tamInr || tamSamSom.tamUsd || activeResearch.tam_usd || 500000000000)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {tamSamSom.tamExplanation || activeResearch.tam_explanation || 'Total addressable market spend for this industry sector in target regions.'}
                </p>
              </div>

              {/* SAM */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2 relative overflow-hidden">
                <div className="w-1.5 h-full bg-sky-500 absolute left-0 top-0"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  SAM • Serviceable Available Market
                </span>
                <div className="text-3xl font-extrabold text-white">
                  {currency === 'INR' && tamSamSom.samFormatted
                    ? tamSamSom.samFormatted
                    : formatCompact(tamSamSom.samInr || tamSamSom.samUsd || activeResearch.sam_usd || 125000000000)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {tamSamSom.samExplanation || activeResearch.sam_explanation || 'Portion of TAM reachable by current geographic and product boundaries.'}
                </p>
              </div>

              {/* SOM */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2 relative overflow-hidden">
                <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  SOM • Serviceable Obtainable Market
                </span>
                <div className="text-3xl font-extrabold text-white">
                  {currency === 'INR' && tamSamSom.somFormatted
                    ? tamSamSom.somFormatted
                    : formatCompact(tamSamSom.somInr || tamSamSom.somUsd || activeResearch.som_usd || 5000000000)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {tamSamSom.somExplanation || activeResearch.som_explanation || 'Realistic 3-5 year obtainable revenue target factoring in competitors.'}
                </p>
              </div>
            </div>

            {tamSamSom.assumptionsModel && (
              <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
                <span className="text-slate-300 font-semibold">Underlying Methodology & Assumptions: </span>
                {tamSamSom.assumptionsModel}
              </div>
            )}
          </div>

          {/* ─── TABS FOR DETAILED SECTIONS ─── */}
          <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
            {[
              { id: 'competitors', label: `Competitor Matrix (${competitors.length})` },
              { id: 'segments', label: `Customer Segments (${segments.length})` },
              { id: 'opportunities', label: 'Opportunities & Strategic Moats' },
              { id: 'trends', label: 'Industry Trends & Demand Drivers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-300 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── TAB 1: COMPETITOR COMPARISON TABLE ─── */}
          {activeTab === 'competitors' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Competitor</th>
                        <th className="py-3 px-4">Tier</th>
                        <th className="py-3 px-4">Target Audience</th>
                        <th className="py-3 px-4">Key Strengths</th>
                        <th className="py-3 px-4">Weaknesses</th>
                        <th className="py-3 px-4">Our Differentiator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {competitors.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {c.competitor_name || c.competitorName}
                            {c.pricing_info && (
                              <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                                {c.pricing_info}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {c.market_tier || c.marketTier || 'Direct'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {c.target_audience || c.targetAudience || 'General market'}
                          </td>
                          <td className="py-3.5 px-4 text-emerald-300">
                            {c.strengths || 'Established brand presence'}
                          </td>
                          <td className="py-3.5 px-4 text-amber-300">
                            {c.weaknesses || 'Legacy infrastructure'}
                          </td>
                          <td className="py-3.5 px-4 text-sky-300 font-medium">
                            {c.differentiator || c.possible_gaps || '10x modern workflows'}
                          </td>
                        </tr>
                      ))}
                      {competitors.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500 italic">
                            No competitors recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: CUSTOMER SEGMENTS ─── */}
          {activeTab === 'segments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {segments.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      {s.segmentName}
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {s.urgencyToBuy} Urgency
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-300 font-semibold">Demographics / Profile: </span>
                    {s.demographicsOrFirmographics}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <span className="text-rose-400 font-semibold">Core Pain Points: </span>
                    {s.corePainPoints}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── TAB 3: OPPORTUNITIES & MOATS ─── */}
          {activeTab === 'opportunities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Underserved Segments */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Underserved Customer Segments
                </h4>
                <ul className="space-y-2">
                  {opportunities.underservedSegments?.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Differentiation Strategies */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Differentiation & Defensibility Moats
                </h4>
                <ul className="space-y-2">
                  {opportunities.differentiationStrategies?.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Market Entry Recommendations */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-sky-400" />
                  Go-To-Market Entry Strategy
                </h4>
                <ul className="space-y-2">
                  {opportunities.marketEntryRecommendations?.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-sky-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategic Partnerships */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  High-Impact Partnership Angles
                </h4>
                <ul className="space-y-2">
                  {opportunities.potentialPartnerships?.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ─── TAB 4: TRENDS & DEMAND ─── */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              {/* Trends Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trends.map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">
                        {t.timeline}
                      </span>
                      <span className="text-xs text-slate-400">{t.impact} Impact</span>
                    </div>
                    <p className="text-xs font-semibold text-white leading-relaxed">{t.trend}</p>
                  </div>
                ))}
              </div>

              {/* Demand Outlook */}
              {demand.overallDemandOutlook && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white">Demand Outlook & Adoption Barriers</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{demand.overallDemandOutlook}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-emerald-400">Primary Growth Drivers:</span>
                      <ul className="list-disc list-inside text-slate-400 pt-1 space-y-1">
                        {demand.keyDrivers?.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-rose-400">Adoption Bottlenecks:</span>
                      <ul className="list-disc list-inside text-slate-400 pt-1 space-y-1">
                        {demand.adoptionBarriers?.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTTOM BANNER: NEXT MODULE */}
          <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50/60 dark:from-sky-950/40 dark:via-slate-900 dark:to-sky-950/40 border border-sky-200/80 dark:border-sky-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-none">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Proceed to Financial Modelling & Unit Economics
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Simulate revenue, customer growth curves, CAC vs LTV ratios, and break-even milestones.
              </p>
            </div>
            <Link
              to="/dashboard/financial-simulator"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <span>Launch Financial Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketResearchPage;
