import { getStartupByIdAndUser } from '../models/startupModel.js';
import { getLatestValidationByStartup } from '../models/validationModel.js';
import {
  getLatestMarketResearchByStartup,
  getCompetitorsByStartup,
} from '../models/marketModel.js';
import { getLatestFinancialModelByStartup } from '../models/financialModel.js';
import { getInvestorSessionsByStartup } from '../models/investorModel.js';
import { getLatestPitchEvaluationByStartup } from '../models/pitchModel.js';
import {
  getReadinessScoreByStartup,
  syncAndRecalculateReadiness,
} from '../models/readinessModel.js';
import { generateStartupPDFReport } from '../services/pdfReportService.js';
import { getUserPreferences } from '../models/userModel.js';
import { getExchangeRates } from '../services/currencyService.js';
import { AppError } from '../middleware/errorHandler.js';

export const getReportDataSummary = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const [
      validation,
      marketResearch,
      competitors,
      financialModel,
      sessions,
      pitchEvaluation,
      readiness,
    ] = await Promise.all([
      getLatestValidationByStartup(startupId).catch(() => null),
      getLatestMarketResearchByStartup(startupId).catch(() => null),
      getCompetitorsByStartup(startupId).catch(() => []),
      getLatestFinancialModelByStartup(startupId).catch(() => null),
      getInvestorSessionsByStartup(startupId).catch(() => []),
      getLatestPitchEvaluationByStartup(startupId).catch(() => null),
      syncAndRecalculateReadiness(startupId).catch(() => null),
    ]);

    const latestSession = sessions.find((s) => s.status === 'completed') || sessions[0] || null;

    res.status(200).json({
      success: true,
      startup,
      sections: {
        validation: !!validation,
        market: !!marketResearch,
        competitorsCount: competitors.length,
        financial: !!financialModel,
        investor: !!latestSession,
        pitch: !!pitchEvaluation,
        readiness: !!readiness,
      },
      readiness,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadPDFReport = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const [
      validation,
      marketResearch,
      competitors,
      financialModel,
      sessions,
      pitchEvaluation,
      readiness,
      userPreferences,
      rateData,
    ] = await Promise.all([
      getLatestValidationByStartup(startupId).catch(() => null),
      getLatestMarketResearchByStartup(startupId).catch(() => null),
      getCompetitorsByStartup(startupId).catch(() => []),
      getLatestFinancialModelByStartup(startupId).catch(() => null),
      getInvestorSessionsByStartup(startupId).catch(() => []),
      getLatestPitchEvaluationByStartup(startupId).catch(() => null),
      syncAndRecalculateReadiness(startupId).catch(() => null),
      getUserPreferences(req.user.id).catch(() => null),
      getExchangeRates().catch(() => null),
    ]);

    const completedSession = sessions.find((s) => s.status === 'completed') || null;
    const activeOrLatestSession = sessions[0] || null;

    // Set response headers for PDF download
    const filename = `${startup.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_VentureMind_Report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const pdfDoc = generateStartupPDFReport({
      startup,
      founder: req.user,
      validation,
      marketResearch,
      competitors,
      financialModel,
      investorSession: completedSession,
      activeSession: !completedSession ? activeOrLatestSession : null,
      pitchEvaluation,
      readiness,
      userPreferences,
      rates: rateData?.rates || null,
    });

    pdfDoc.pipe(res);
  } catch (error) {
    next(error);
  }
};
