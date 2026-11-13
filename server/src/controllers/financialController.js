import { getStartupByIdAndUser } from '../models/startupModel.js';
import { calculateFinancialModel } from '../services/financialCalculationService.js';
import {
  saveFinancialModel,
  getFinancialModelsByStartup,
  getLatestFinancialModelByStartup,
  deleteFinancialModelById,
} from '../models/financialModel.js';
import { getUserPreferences } from '../models/userModel.js';
import { updateModuleReadinessScore } from '../models/readinessModel.js';
import { explainFinancialResultsWithAI } from '../services/geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

// Instant live simulation calculation
export const simulateFinancials = async (req, res, next) => {
  try {
    const inputs = req.body || {};
    const results = calculateFinancialModel(inputs);

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};

// Save a financial scenario for a startup
export const saveFinancialScenario = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const { modelName = 'Base Financial Plan', inputs = {} } = req.body;
    const results = calculateFinancialModel(inputs);

    // Optional AI CFO analysis for qualitative strategic insights
    let aiCritique = null;
    try {
      const userPrefs = await getUserPreferences(req.user.id).catch(() => null);
      aiCritique = await explainFinancialResultsWithAI(
        startup,
        results,
        userPrefs?.currency || 'INR'
      );
    } catch (aiErr) {
      console.warn('AI financial critique skipped:', aiErr.message);
    }

    const saved = await saveFinancialModel({
      startup_id: startup.id,
      model_name: modelName,
      pricing_model: startup.revenue_model || 'SaaS',
      default_price: results.price,
      cac: results.cac,
      ltv: results.netLtv,
      monthly_churn_rate: results.monthlyChurnRate,
      monthly_burn_rate: results.fixedMonthlyCosts,
      inputs,
      results: { ...results, aiCritique },
      scenarios: results.forecasts,
    });

    // Derive a financial readiness score based on unit economics (LTV/CAC, margin, payback)
    let financialScore = 60;
    if (results.ltvCacRatio >= 3.0) financialScore += 20;
    else if (results.ltvCacRatio >= 1.5) financialScore += 10;
    if (results.paybackMonths && results.paybackMonths <= 12) financialScore += 10;
    if (results.contributionMarginRatio >= 50) financialScore += 10;
    financialScore = Math.min(95, Math.max(30, financialScore));

    await updateModuleReadinessScore({
      startup_id: startup.id,
      moduleType: 'financial',
      score: financialScore,
    });

    res.status(201).json({
      success: true,
      message: 'Financial simulation model saved successfully!',
      model: {
        id: saved.id,
        startup_id: startup.id,
        modelName,
        results: { ...results, aiCritique },
        financialScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStartupFinancialModels = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const models = await getFinancialModelsByStartup(startupId);
    res.status(200).json({
      success: true,
      count: models.length,
      models,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFinancialModel = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const modelId = Number(req.params.modelId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    await deleteFinancialModelById(modelId, startupId);
    res.status(200).json({
      success: true,
      message: 'Financial scenario model deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
