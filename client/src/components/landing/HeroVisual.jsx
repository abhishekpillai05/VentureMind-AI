import React, { useState } from 'react';
import {
  Lightbulb,
  Globe,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  Bot,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

export const HeroVisual = () => {
  const [activeTab, setActiveTab] = useState('simulation');

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 sm:mt-16 px-2 sm:px-4">
      {/* Dynamic multi-color ambient glow behind the preview */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/15 rounded-3xl blur-3xl -z-10 opacity-70 animate-pulse-glow" />

      {/* Main glass frame */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-white/[0.12] bg-white/95 dark:bg-[#090d16]/80 backdrop-blur-2xl p-4 sm:p-7 shadow-2xl shadow-indigo-500/5 dark:shadow-black/80 overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-cyber opacity-40 pointer-events-none" />

        {/* Top Control Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">LIVE SIMULATOR</span>
            </div>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-mono">
              Venture: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">PulseAI Health</span>
            </span>
          </div>

          {/* Quick Module Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'simulation'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Investor Room
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'metrics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              TAM & Sizing
            </button>
            <button
              onClick={() => setActiveTab('readiness')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'readiness'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Readiness Score
            </button>
          </div>
        </div>

        {/* 3-Column Glass Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Idea & Market Validation (4 cols) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Validation Node Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1322]/80 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300 shadow-sm dark:shadow-lg group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                  STEP 01
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Idea Validation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Problem-Solution Fit & Lean Canvas</p>
              
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Viability Score</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 92% (High)
                </span>
              </div>
            </div>

            {/* Market Sizing Node Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1322]/80 border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 shadow-sm dark:shadow-lg group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20">
                  STEP 02
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Market Sizing (TAM/SAM)</h4>
              
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Global TAM:</span>
                  <span className="text-cyan-600 dark:text-cyan-300 font-bold">$8.4 Billion</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="w-4/5 h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Interactive AI Investor Simulation / Synthesis (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:via-[#0d1322] dark:to-[#090d16] border border-slate-200 dark:border-indigo-500/30 shadow-sm dark:shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Alex Morgan (Tier 1 VC)</h5>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● Virtual Partner Active</span>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                Turn 4/8
              </span>
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="space-y-3 my-2 text-xs">
              {/* VC Message */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
                <p className="font-semibold text-indigo-600 dark:text-indigo-300 text-[11px] mb-1">Alex Morgan:</p>
                <p className="leading-relaxed">
                  "Your 4.2x LTV-to-CAC ratio is compelling, but how will customer acquisition hold up once Meta ad costs spike 20% in Q3?"
                </p>
              </div>

              {/* Founder Response Pill */}
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-100 ml-3 shadow-sm dark:shadow-none">
                <p className="font-semibold text-indigo-600 dark:text-indigo-300 text-[11px] mb-1">Founder Pitch Answer:</p>
                <p className="leading-relaxed">
                  "We rely on organic EHR integrations and viral doctor-to-patient referrals, keeping paid acquisition below 28% of total volume."
                </p>
              </div>
            </div>

            {/* Simulated Live Sentiment Meter */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Investor Sentiment:</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30">
                Term Sheet Likely (88%)
              </span>
            </div>
          </div>

          {/* Right Column: Readiness Index Gauge (3 cols) */}
          <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-[#0d1322]/80 border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between text-center shadow-sm dark:shadow-lg">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center mx-auto mb-3 text-white shadow-lg shadow-indigo-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Startup Readiness Index
              </h5>
              
              {/* Radial Big Score (Image 4 Clean Light Mode Box) */}
              <div className="my-4 py-4 px-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 dark:from-indigo-400 dark:via-violet-300 dark:to-emerald-400">
                  91
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-mono">
                  Out of 100
                </span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  Grade A: Investor-Ready
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-left text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Validation Fit:</span>
                <span className="text-slate-900 dark:text-white font-semibold">94%</span>
              </div>
              <div className="flex justify-between">
                <span>Financial Model:</span>
                <span className="text-slate-900 dark:text-white font-semibold">88%</span>
              </div>
              <div className="flex justify-between">
                <span>Defensibility Moat:</span>
                <span className="text-slate-900 dark:text-white font-semibold">91%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security / Feature Strip */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Neon PostgreSQL Cloud · Data Privacy Guaranteed</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Deterministic Scoring</span>
            <span>•</span>
            <span>Gemini AI Intelligence</span>
            <span>•</span>
            <span>5-Axis Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
