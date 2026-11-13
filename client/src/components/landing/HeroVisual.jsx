import React from 'react';
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
} from 'lucide-react';

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16 px-4">
      {/* Ambient gradient glow behind visual */}
      <div className="absolute inset-0 -top-8 bg-gradient-to-r from-indigo-600/10 via-violet-600/15 to-blue-600/10 rounded-3xl blur-2xl -z-10" />

      {/* Outer frame */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        {/* Top header indicator */}
        <div className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-800/60 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Venture Intelligence Engine
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 px-3 py-1 rounded-full border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Validation Pipeline</span>
          </div>
        </div>

        {/* Interactive nodes grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Column: Input & Market Nodes */}
          <div className="space-y-4">
            {/* Node 1: Idea Ingestion */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Step 1
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Idea & Problem Validation</h4>
              <p className="text-[11px] text-slate-400 mt-1">Lean Canvas & SWOT Analysis</p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Problem-Solution Fit: 85%</span>
              </div>
            </div>

            {/* Node 2: Market Intelligence */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Step 2
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Market & Sizing Engine</h4>
              <p className="text-[11px] text-slate-400 mt-1">TAM / SAM / SOM Modeling</p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Market Opportunity: High</span>
              </div>
            </div>
          </div>

          {/* Center Column: Central Synthesis Engine */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 text-center relative shadow-lg shadow-indigo-950/20">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-600/30">
              <Zap className="w-7 h-7" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Synthesis Output
            </p>
            <h3 className="text-lg font-bold text-white mt-1">Startup Readiness Index</h3>
            
            {/* Visual Circular Gauge Representation */}
            <div className="my-4 py-3 px-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400">
                88
              </span>
              <span className="text-xs text-slate-500 ml-1">/ 100</span>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">
                Investability Score: High
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesizing market depth, unit economics, and simulated investor feedback.
            </p>
          </div>

          {/* Right Column: Financials & Investor Nodes */}
          <div className="space-y-4">
            {/* Node 3: Financial Simulator */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Step 3
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Unit Economics & Runway</h4>
              <p className="text-[11px] text-slate-400 mt-1">CAC, LTV & 3-Year Projections</p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LTV / CAC Ratio: 4.8x</span>
              </div>
            </div>

            {/* Node 4: Investor Pitch Grilling */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-violet-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Step 4
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Multi-Persona AI VCs</h4>
              <p className="text-[11px] text-slate-400 mt-1">Realistic Pushback & Pitch Scoring</p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Term Sheet Readiness: Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom micro-features ticker */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cryptographically Secure Session & Data Isolation</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Dynamic Unit Modeling
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Multi-Agent Simulation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
