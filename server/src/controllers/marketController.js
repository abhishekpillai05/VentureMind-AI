import { getStartupByIdAndUser } from '../models/startupModel.js';
import {
  saveMarketResearch,
  saveCompetitors,
  getLatestMarketResearchByStartup,
  getCompetitorsByStartup,
  getMarketResearchHistoryByStartup,
} from '../models/marketModel.js';
import { updateModuleReadinessScore } from '../models/readinessModel.js';
import { generateMarketResearchWithAI } from '../services/geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyzeMarketResearch = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    if (!startupId || isNaN(startupId)) {
      return next(new AppError('Invalid startup ID provided.', 400));
    }

    // 1. Verify user ownership
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    // 2. Generate market intelligence via Gemini
    const aiResult = await generateMarketResearchWithAI(startup);

    // 3. Save into MySQL market_research table
    const saved = await saveMarketResearch({
      startup_id: startup.id,
      tam_usd: aiResult.tamSamSom?.tamInr || aiResult.tamSamSom?.tamUsd || 0,
      sam_usd: aiResult.tamSamSom?.samInr || aiResult.tamSamSom?.samUsd || 0,
      som_usd: aiResult.tamSamSom?.somInr || aiResult.tamSamSom?.somUsd || 0,
      tam_explanation: aiResult.tamSamSom?.tamExplanation || null,
      sam_explanation: aiResult.tamSamSom?.samExplanation || null,
      som_explanation: aiResult.tamSamSom?.somExplanation || null,
      customer_segments: aiResult.targetCustomerSegments || [],
      growth_drivers: aiResult.marketDemand?.keyDrivers || [],
      barriers_to_entry: aiResult.marketDemand?.adoptionBarriers || [],
      market_trends: aiResult.marketTrends || [],
      market_opportunities: aiResult.marketOpportunities || {},
      full_report: aiResult,
    });

    // 4. Save competitor matrix
    if (aiResult.competitors && aiResult.competitors.length > 0) {
      await saveCompetitors(startup.id, aiResult.competitors);
    }

    // 5. Update readiness score for Market Readiness
    const marketScore = aiResult.marketReadinessScore || 70;
    await updateModuleReadinessScore({
      startup_id: startup.id,
      moduleType: 'market',
      score: marketScore,
    });

    res.status(200).json({
      success: true,
      message: 'Market research and competitor benchmark generated successfully!',
      marketResearch: {
        id: saved.id,
        startup_id: startup.id,
        marketReadinessScore: marketScore,
        full_report: aiResult,
        competitors: aiResult.competitors,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestMarketResearch = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const marketResearch = await getLatestMarketResearchByStartup(startupId);
    const competitors = await getCompetitorsByStartup(startupId);

    res.status(200).json({
      success: true,
      startup: { id: startup.id, name: startup.name, industry: startup.industry },
      marketResearch,
      competitors,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketHistory = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const history = await getMarketResearchHistoryByStartup(startupId);
    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};
