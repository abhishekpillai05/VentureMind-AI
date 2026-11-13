import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Rocket,
  Plus,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Calendar,
  Layers,
  AlertCircle,
  TrendingUp,
  Tag,
} from 'lucide-react';
import startupService from '../../services/startupService';
import StartupFormModal from '../../components/startups/StartupFormModal';

export const StartupListPage = () => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await startupService.getAllStartups();
      if (res?.success) {
        setStartups(res.startups || []);
      }
    } catch (err) {
      console.error('Failed to load startups:', err);
      setError('Unable to load your startup ventures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const handleCreateStartup = async (formData) => {
    await startupService.createStartup(formData);
    await fetchStartups();
  };

  // Distinct industries & stages for filter options
  const industries = ['All', ...new Set(startups.map((s) => s.industry).filter(Boolean))];
  const stages = ['All', 'Idea', 'Validation', 'Prototype/MVP', 'Early Traction', 'Scaling'];

  // Filtered startups
  const filteredStartups = startups.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.problem_statement?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = selectedIndustry === 'All' || s.industry === selectedIndustry;
    const matchesStage = selectedStage === 'All' || s.stage === selectedStage;

    return matchesSearch && matchesIndustry && matchesStage;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Rocket className="w-6 h-6 text-indigo-400" />
            Startup Portfolio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your venture concepts, trigger AI validator evaluations, and simulate investor pitches.
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

      {/* ─── FILTERS & SEARCH BAR ─── */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search startups, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                Industry: {ind}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {stages.map((st) => (
              <option key={st} value={st}>
                Stage: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── STARTUP LIST OR EMPTY STATE ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 h-64 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 bg-slate-800 rounded w-2/3"></div>
                <div className="h-4 bg-slate-800/60 rounded w-1/3"></div>
                <div className="h-12 bg-slate-800/40 rounded mt-4"></div>
              </div>
              <div className="h-8 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredStartups.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {searchQuery || selectedIndustry !== 'All' || selectedStage !== 'All'
              ? 'No matching startups found'
              : 'No startups created yet'}
          </h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            {searchQuery || selectedIndustry !== 'All' || selectedStage !== 'All'
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'Add your first startup concept to begin validation, financial modeling, and investor pitching.'}
          </p>
          {searchQuery || selectedIndustry !== 'All' || selectedStage !== 'All' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('All');
                setSelectedStage('All');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Startup</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.map((startup) => {
            const hasValidation = startup.readiness_score !== null || startup.latest_validation_score !== null;
            const score = startup.latest_validation_score ?? startup.readiness_score;

            return (
              <div
                key={startup.id}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Top Bar: Industry & Stage Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full truncate max-w-[150px]">
                      {startup.industry}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {startup.stage}
                    </span>
                  </div>

                  {/* Startup Name & Tagline */}
                  <Link
                    to={`/dashboard/startups/${startup.id}`}
                    className="block group-hover:text-indigo-300 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-white truncate">{startup.name}</h3>
                    {startup.tagline && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 italic">
                        "{startup.tagline}"
                      </p>
                    )}
                  </Link>

                  {/* Problem Snippet */}
                  <p className="text-xs text-slate-300 line-clamp-2 mt-3 leading-relaxed">
                    {startup.problem_statement}
                  </p>
                </div>

                {/* Bottom Bar: Readiness & Action */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    {hasValidation ? (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">
                          {score}/100
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">Readiness</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Not validated yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/validator/${startup.id}`}
                      title="Validate with AI"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                    >
                      <BrainCircuit className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/dashboard/startups/${startup.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <StartupFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStartup}
        title="Create New Startup"
      />
    </div>
  );
};

export default StartupListPage;
