import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Percent,
  Users,
  Clock,
  Sparkles,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import startupService from '../../services/startupService';
import financialService from '../../services/financialService';
import { useCurrency } from '../../context/CurrencyContext';
import { formatNumberIN } from '../../utils/formatters';

export const FinancialSimulatorPage = () => {
  const { startupId: paramStartupId } = useParams();
  const navigate = useNavigate();
  const { currency, currencySymbol, format, formatCompact, rateDate } = useCurrency();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(paramStartupId || '');
  const [loadingStartups, setLoadingStartups] = useState(true);

  // Form inputs state in INR (₹)
  const [inputs, setInputs] = useState({
    productName: 'SaaS Subscription Tier',
    price: 2999,
    startingCustomers: 100,
    monthlyGrowthRate: 8,
    cac: 4500,
    variableCostPerCustomer: 350,
    marketingExpenses: 50000,
    employeeExpenses: 150000,
    infrastructureExpenses: 25000,
    otherExpenses: 15000,
    initialInvestment: 1000000,
    monthlyChurnRate: 3.5,
  });

  // Calculation output state
  const [simulation, setSimulation] = useState(null);
  const [activeScenario, setActiveScenario] = useState('realistic'); // 'conservative' | 'realistic' | 'optimistic'
  const [savedModels, setSavedModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Save Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('Baseline Plan');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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

  // 2. Fetch saved models for selected startup
  useEffect(() => {
    if (!selectedStartupId) return;

    const loadSaved = async () => {
      try {
        setLoadingModels(true);
        const res = await financialService.getModels(selectedStartupId);
        if (res?.success) {
          setSavedModels(res.models || []);
        }
      } catch (err) {
        console.error('Error fetching financial models:', err);
      } finally {
        setLoadingModels(false);
      }
    };
    loadSaved();
  }, [selectedStartupId]);

  // 3. Run instant calculation whenever inputs change
  useEffect(() => {
    const runCalc = async () => {
      try {
        const res = await financialService.simulate(inputs);
        if (res?.success) {
          setSimulation(res.results);
        }
      } catch (err) {
        console.error('Simulation error:', err);
      }
    };
    runCalc();
  }, [inputs]);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveScenario = async (e) => {
    e.preventDefault();
    if (!selectedStartupId) return;

    try {
      setSaving(true);
      setError(null);
      await financialService.saveScenario(selectedStartupId, scenarioName, inputs);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaveModalOpen(false);
        setSaveSuccess(false);
      }, 1400);

      const res = await financialService.getModels(selectedStartupId);
      if (res?.success) setSavedModels(res.models || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save financial model.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadModel = (model) => {
    if (model.inputs) {
      setInputs(model.inputs);
      setScenarioName(model.model_name || 'Loaded Scenario');
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      await financialService.deleteModel(selectedStartupId, modelId);
      setSavedModels((prev) => prev.filter((m) => m.id !== modelId));
    } catch (err) {
      console.error('Failed to delete model:', err);
    }
  };

  const selectedStartup = startups.find((s) => String(s.id) === String(selectedStartupId));
  const forecasts = simulation?.forecasts || {};
  const currentForecastData = forecasts[activeScenario] || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Financial Simulator & Unit Economics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic CAC vs LTV modelling, 12-month multi-scenario forecasting, and break-even analysis.
          </p>
        </div>

        {startups.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.industry})
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Scenario</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── INSTANT UNIT ECONOMICS CARDS ─── */}
      {simulation && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* 1. M1 Revenue */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Month 1 Revenue
            </span>
            <div className="text-xl font-bold text-white">
              {format(simulation.month1Snapshot.revenue)}
            </div>
            <span className="text-[10px] text-slate-500">{formatNumberIN(inputs.startingCustomers)} active accounts</span>
          </div>

          {/* 2. Fixed Costs */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Fixed Monthly Burn
            </span>
            <div className="text-xl font-bold text-slate-200">
              {format(simulation.fixedMonthlyCosts)}
            </div>
            <span className="text-[10px] text-slate-500">Payroll, tools, infra</span>
          </div>

          {/* 3. LTV / CAC */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
              LTV : CAC Ratio
            </span>
            <div
              className={`text-xl font-bold ${
                simulation.ltvCacRatio >= 3.0
                  ? 'text-emerald-400'
                  : simulation.ltvCacRatio >= 1.5
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {simulation.ltvCacRatio}x
            </div>
            <span className="text-[10px] text-slate-500">Net LTV: {format(simulation.netLtv)} / CAC: {format(inputs.cac)}</span>
          </div>

          {/* 4. Payback Period */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Payback Period
            </span>
            <div className="text-xl font-bold text-white">
              {simulation.paybackMonths ? `${simulation.paybackMonths} mo` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500">To recoup CAC</span>
          </div>

          {/* 5. Contribution Margin */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Contrib. Margin
            </span>
            <div className="text-xl font-bold text-sky-400">
              {format(simulation.contributionMarginPerCustomer)} ({simulation.contributionMarginRatio}%)
            </div>
            <span className="text-[10px] text-slate-500">Per user/month</span>
          </div>

          {/* 6. Break-Even Volume */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Break-Even Point
            </span>
            <div className="text-xl font-bold text-amber-400">
              {simulation.breakEvenCustomers ? `${formatNumberIN(simulation.breakEvenCustomers)} users` : 'Unreachable'}
            </div>
            <span className="text-[10px] text-slate-500">{format(simulation.breakEvenRevenue)} / mo</span>
          </div>
        </div>
      )}

      {/* ─── MAIN SIMULATOR WORKSPACE: INPUTS + CHARTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls (4 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-bold">₹</span>
              Dynamic Model Assumptions (INR)
            </h3>
            <span className="text-[11px] text-slate-400">Live sliders</span>
          </div>

          {/* Price & Customers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Selling Price ({currencySymbol}/mo)
              </label>
              <input
                type="number"
                min="1"
                value={inputs.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Starting Customers
              </label>
              <input
                type="number"
                min="1"
                value={inputs.startingCustomers}
                onChange={(e) => handleInputChange('startingCustomers', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Growth Rate Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Monthly Customer Growth</span>
              <span className="font-bold text-emerald-400">{inputs.monthlyGrowthRate}% / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={inputs.monthlyGrowthRate}
              onChange={(e) => handleInputChange('monthlyGrowthRate', Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* CAC & Variable Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                CAC (Acquisition Cost {currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={inputs.cac}
                onChange={(e) => handleInputChange('cac', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Variable Cost / User ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={inputs.variableCostPerCustomer}
                onChange={(e) => handleInputChange('variableCostPerCustomer', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Churn Rate Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Monthly Churn Rate</span>
              <span className="font-bold text-rose-400">{inputs.monthlyChurnRate}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={inputs.monthlyChurnRate}
              onChange={(e) => handleInputChange('monthlyChurnRate', Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          {/* Monthly Fixed Cost Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Monthly Fixed Expenses ({currencySymbol}):</span>
              <span className="text-[10px] text-slate-500 font-normal">Base: INR</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Marketing & Ads ({currencySymbol}):</span>
                <input
                  type="number"
                  min="0"
                  value={inputs.marketingExpenses}
                  onChange={(e) => handleInputChange('marketingExpenses', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white text-xs mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Payroll / Team ({currencySymbol}):</span>
                <input
                  type="number"
                  min="0"
                  value={inputs.employeeExpenses}
                  onChange={(e) => handleInputChange('employeeExpenses', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white text-xs mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Cloud & Infra ({currencySymbol}):</span>
                <input
                  type="number"
                  min="0"
                  value={inputs.infrastructureExpenses}
                  onChange={(e) => handleInputChange('infrastructureExpenses', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white text-xs mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Other OpEx ({currencySymbol}):</span>
                <input
                  type="number"
                  min="0"
                  value={inputs.otherExpenses}
                  onChange={(e) => handleInputChange('otherExpenses', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white text-xs mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Saved Scenarios List */}
          {savedModels.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Saved Scenarios ({savedModels.length}):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {savedModels.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="font-medium text-white truncate max-w-[180px]">
                      {m.model_name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleLoadModel(m)}
                        className="text-xs text-emerald-400 hover:underline"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteModel(m.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Charts & Projections (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Scenario Selector */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-xs font-semibold text-slate-300">12-Month Forecast Horizon:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'conservative', label: 'Conservative (50%)' },
                { id: 'realistic', label: 'Realistic (100%)' },
                { id: 'optimistic', label: 'Optimistic (150%)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(s.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeScenario === s.id
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue vs Expenses Area Chart */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly Revenue vs Total Operating Costs</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing profitability trajectory and cash inflection point.
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentForecastData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => formatCompact(val)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                    formatter={(val) => [format(val), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={`Revenue (${currencySymbol})`}
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalExpenses"
                    name={`Total Expenses (${currencySymbol})`}
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorExp)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Volume Growth Chart */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-1">Subscriber & Customer Growth Ramp</h3>
            <p className="text-xs text-slate-400 mb-4">
              Projected active accounts scaling over 12 months under {activeScenario} assumptions.
            </p>

            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentForecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                    formatter={(val) => [`${val} customers`, 'Customers']}
                  />
                  <Bar dataKey="customers" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Month 12 Snapshot Callout */}
          {currentForecastData[11] && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Month 12 Projected Run-Rate:</span>
              <div className="flex items-center gap-4 text-slate-200">
                <span>
                  MRR: <strong className="text-white">{format(currentForecastData[11].revenue)}</strong>
                </span>
                <span>
                  Net Profit:{' '}
                  <strong
                    className={currentForecastData[11].netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                  >
                    {format(currentForecastData[11].netProfit)} ({currentForecastData[11].profitMargin}%)
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── SAVE SCENARIO MODAL ─── */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-emerald-400" />
              Save Financial Scenario
            </h3>
            <p className="text-xs text-slate-400">
              Save this configuration to your startup portfolio and incorporate it into your Readiness Score.
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {error}
              </div>
            )}

            {saveSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Scenario saved and Readiness Score synchronized!</span>
              </div>
            ) : (
              <form onSubmit={handleSaveScenario} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Scenario Title</label>
                  <input
                    type="text"
                    required
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="e.g. Aggressive Growth Q3"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm & Save</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSimulatorPage;
