/**
 * Deterministic Startup Readiness Scoring Engine
 * Pro-rates weights across available completed modules transparently
 */

const MODULE_WEIGHTS = {
  validation: 0.25, // 25%
  market: 0.20,     // 20%
  financial: 0.20,  // 20%
  investor: 0.15,   // 15%
  pitch: 0.20,      // 20%
};

export const calculateStartupReadiness = ({
  validationScore = null,
  marketScore = null,
  financialScore = null,
  investorScore = null,
  pitchScore = null,
}) => {
  const modules = [
    {
      key: 'validation',
      name: 'Idea Validation',
      score: validationScore !== null && validationScore !== undefined ? Number(validationScore) : null,
      baseWeight: MODULE_WEIGHTS.validation,
      completed: validationScore !== null && validationScore !== undefined,
    },
    {
      key: 'market',
      name: 'Market Readiness',
      score: marketScore !== null && marketScore !== undefined ? Number(marketScore) : null,
      baseWeight: MODULE_WEIGHTS.market,
      completed: marketScore !== null && marketScore !== undefined,
    },
    {
      key: 'financial',
      name: 'Financial Health',
      score: financialScore !== null && financialScore !== undefined ? Number(financialScore) : null,
      baseWeight: MODULE_WEIGHTS.financial,
      completed: financialScore !== null && financialScore !== undefined,
    },
    {
      key: 'investor',
      name: 'Investor Simulation',
      score: investorScore !== null && investorScore !== undefined ? Number(investorScore) : null,
      baseWeight: MODULE_WEIGHTS.investor,
      completed: investorScore !== null && investorScore !== undefined,
    },
    {
      key: 'pitch',
      name: 'Pitch Performance',
      score: pitchScore !== null && pitchScore !== undefined ? Number(pitchScore) : null,
      baseWeight: MODULE_WEIGHTS.pitch,
      completed: pitchScore !== null && pitchScore !== undefined,
    },
  ];

  const completedModules = modules.filter((m) => m.completed);
  const pendingModules = modules.filter((m) => !m.completed);

  // If no modules completed
  if (completedModules.length === 0) {
    return {
      overallScore: 0,
      stageLabel: 'Early Stage (Unassessed)',
      completionPercentage: 0,
      completedCount: 0,
      totalCount: modules.length,
      modules,
      weakestArea: null,
      strongestArea: null,
      formulaExplanation: 'No simulation modules completed yet.',
    };
  }

  // Calculate total base weight of completed modules to re-normalize to 100%
  const totalCompletedBaseWeight = completedModules.reduce((acc, m) => acc + m.baseWeight, 0);

  // Re-normalized weighted average
  let weightedSum = 0;
  completedModules.forEach((m) => {
    const normalizedWeight = m.baseWeight / totalCompletedBaseWeight;
    weightedSum += m.score * normalizedWeight;
  });

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedSum)));

  // Categorize Readiness
  let stageLabel = 'Early Stage';
  let badgeColor = 'rose';
  if (overallScore >= 90) {
    stageLabel = 'Highly Prepared (Venture Ready)';
    badgeColor = 'emerald';
  } else if (overallScore >= 75) {
    stageLabel = 'Nearly Investor Ready';
    badgeColor = 'indigo';
  } else if (overallScore >= 60) {
    stageLabel = 'Developing';
    badgeColor = 'amber';
  } else if (overallScore >= 40) {
    stageLabel = 'Needs Improvement';
    badgeColor = 'amber';
  }

  // Sort completed modules to find strengths and weaknesses
  const sorted = [...completedModules].sort((a, b) => a.score - b.score);
  const weakestArea = sorted[0] || null;
  const strongestArea = sorted[sorted.length - 1] || null;

  const completionPercentage = Math.round((completedModules.length / modules.length) * 100);

  return {
    overallScore,
    stageLabel,
    badgeColor,
    completionPercentage,
    completedCount: completedModules.length,
    totalCount: modules.length,
    modules,
    weakestArea: weakestArea ? { name: weakestArea.name, score: weakestArea.score } : null,
    strongestArea: strongestArea ? { name: strongestArea.name, score: strongestArea.score } : null,
    formulaExplanation: `Weighted average across ${completedModules.length} of ${modules.length} modules (${completedModules.map(m => `${m.name}: ${Math.round((m.baseWeight/totalCompletedBaseWeight)*100)}%`).join(', ')}).`,
  };
};
