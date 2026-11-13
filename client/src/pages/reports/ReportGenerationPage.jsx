import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  BrainCircuit,
  Globe,
  BarChart3,
  Users,
  Target,
  Award,
  ShieldAlert,
} from 'lucide-react';
import startupService from '../../services/startupService';
import reportService from '../../services/reportService';
import { useCurrency } from '../../context/CurrencyContext';

export const ReportGenerationPage = () => {
  const { startupId: paramStartupId } = useParams();
  const navigate = useNavigate();
  const { currency, currencySymbol } = useCurrency();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(paramStartupId || '');
  const [loadingStartups, setLoadingStartups] = useState(true);

  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

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

  // 2. Fetch report data summary for selected startup
  useEffect(() => {
    if (!selectedStartupId) return;

    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        setError(null);
        const res = await reportService.getSummary(selectedStartupId);
        if (res?.success) {
          setSummaryData(res);
        }
      } catch (err) {
        console.error('Failed to load report summary:', err);
      } finally {
        setLoadingSummary(false);
      }
    };
    loadSummary();
  }, [selectedStartupId]);

  const selectedStartup = startups.find((s) => String(s.id) === String(selectedStartupId));
  const sections = summaryData?.sections || {};
  const readiness = summaryData?.readiness || {};

  const handleDownload = async () => {
    if (!selectedStartupId) return;
    try {
      setDownloading(true);
      setError(null);
      await reportService.downloadPdf(selectedStartupId, selectedStartup?.name || 'Venture');
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to generate PDF. Ensure the server is reachable.');
    } finally {
      setDownloading(false);
    }
  };

  const sectionItems = [
    {
      name: 'Startup Profile & Architecture',
      desc: 'Problem, solution, customer persona, monetization model',
      ready: true,
      icon: FileText,
      link: `/dashboard/startups/${selectedStartupId}`,
    },
    {
      name: 'AI Idea Validation & SWOT Matrix',
      desc: 'Viability rating, 9-dimension scores, SWOT factors',
      ready: sections.validation,
      icon: BrainCircuit,
      link: `/dashboard/validator/${selectedStartupId}`,
    },
    {
      name: 'Market Research & TAM/SAM/SOM',
      desc: 'Addressable market models, industry tailwinds, competitor table',
      ready: sections.market,
      icon: Globe,
      link: `/dashboard/market-research/${selectedStartupId}`,
    },
    {
      name: 'Financial Projections & Unit Economics',
      desc: '12-month CAC, LTV, contribution margin & break-even points',
      ready: sections.financial,
      icon: BarChart3,
      link: `/dashboard/financial-simulator/${selectedStartupId}`,
    },
    {
      name: 'Virtual Investor Simulation Verdict',
      desc: 'Debrief commentary, term sheet verdict, investor score',
      ready: sections.investor,
      icon: Users,
      link: `/dashboard/investor/${selectedStartupId}`,
    },
    {
      name: 'Pitch Deck & Script Evaluation',
      desc: '10-axis radar score, storytelling improvements, rewritten narrative',
      ready: sections.pitch,
      icon: Target,
      link: `/dashboard/pitch-evaluation/${selectedStartupId}`,
    },
    {
      name: 'Overall Startup Readiness Score',
      desc: 'Composite weighted readiness benchmark and founder checklist',
      ready: sections.readiness,
      icon: Award,
      link: `/dashboard/readiness/${selectedStartupId}`,
    },
  ];

  const readyCount = sectionItems.filter((s) => s.ready).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              Module 6 • Executive Dossier Export
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3 mt-1.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            Investor-Ready PDF Report Generation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Export a comprehensive investor memo, compilation report, and executive dossier ready for incubators and angels.
          </p>
        </div>

        {startups.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedStartupId}
              onChange={(e) => {
                setSelectedStartupId(e.target.value);
                navigate(`/dashboard/reports/${e.target.value}`);
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

      {/* ─── DOWNLOAD ACTION BANNER ─── */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                {readyCount} of {sectionItems.length} Sections Ready
              </span>
              {readiness.overallScore && (
                <span className="text-xs text-slate-400 font-semibold">
                  Overall Readiness: {readiness.overallScore}/100
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {selectedStartup?.name} — Executive Investor Dossier
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Generates a multi-page, formatted PDF containing authentic database records,
              deterministic financial tables (converted & formatted in {currency} {currencySymbol}), addressable market models, and advisory disclaimers.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg transition-all self-start lg:self-auto"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF Dossier...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Executive PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── SECTION COMPLETENESS CHECKLIST ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Report Section Completeness</h3>
          <span className="text-xs text-slate-400">
            Uncompleted sections will be labelled gracefully in the final PDF
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionItems.map((sec, idx) => {
            const Icon = sec.icon;

            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      sec.ready ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{sec.name}</span>
                    <span className="text-[11px] text-slate-400">{sec.desc}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      sec.ready
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {sec.ready ? 'Included' : 'Pending'}
                  </span>
                  {!sec.ready && (
                    <Link
                      to={sec.link}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium ml-1"
                    >
                      Complete →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer Card */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Advisory Notice:</strong> Generated reports are compiled for entrepreneurial training,
          pitch rehearsal, and strategic discovery. They do not constitute certified financial audits,
          regulated investment offers, or guaranteed funding agreements.
        </span>
      </div>
    </div>
  );
};

export default ReportGenerationPage;
