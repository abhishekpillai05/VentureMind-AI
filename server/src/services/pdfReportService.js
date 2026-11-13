import PDFDocument from 'pdfkit';
import {
  formatCurrency,
  formatCompactCurrency,
  formatINR,
  formatCompactINR,
  SYMBOLS,
} from '../utils/formatters.js';

/**
 * Builds a clean, professional investor-ready PDF dossier
 * using pdfkit and streams directly to response
 */
export const generateStartupPDFReport = ({
  startup,
  validation,
  marketResearch,
  competitors = [],
  financialModel,
  investorSession,
  pitchEvaluation,
  readiness,
  userPreferences = null,
  rates = null,
}) => {
  const targetCurrency = userPreferences?.currency || 'INR';
  const targetSymbol = SYMBOLS[targetCurrency] || userPreferences?.currency_symbol || '₹';

  // Currency formatting helper bound to user preferences
  const fmt = (amount, decimals = false) => formatCurrency(amount, targetCurrency, decimals, rates);
  const fmtCompact = (amount) => formatCompactCurrency(amount, targetCurrency, rates);
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 45, right: 45 },
    bufferPages: true,
  });

  const primaryColor = '#4338ca'; // Indigo 700
  const secondaryColor = '#0f172a'; // Slate 900
  const mutedColor = '#64748b'; // Slate 500
  const lightBg = '#f8fafc'; // Slate 50
  const darkNavy = '#020617';

  // Helper for Section Titles
  const addSectionHeader = (title) => {
    doc.moveDown(1);
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(title);
    doc.strokeColor('#cbd5e1').lineWidth(0.75).moveTo(45, doc.y + 4).lineTo(550, doc.y + 4).stroke();
    doc.moveDown(0.6);
  };

  // Helper for Subheaders
  const addSubHeader = (title) => {
    doc.fillColor(secondaryColor).fontSize(11).font('Helvetica-Bold').text(title);
    doc.moveDown(0.2);
  };

  const addBodyText = (text) => {
    doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(text || 'N/A', {
      lineGap: 2.5,
      align: 'justify',
    });
    doc.moveDown(0.4);
  };

  // ─── COVER / HEADER BANNER ───
  doc.rect(45, 40, 505, 75).fill(darkNavy);
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('VENTUREMIND AI', 60, 52);
  doc.fillColor('#a5b4fc').fontSize(10).font('Helvetica').text('Comprehensive Executive Startup Dossier & Simulation Report', 60, 77);
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 60, 93);
  doc.y = 130;

  // ─── STARTUP OVERVIEW ───
  doc.fillColor(secondaryColor).fontSize(18).font('Helvetica-Bold').text(startup.name);
  if (startup.tagline) {
    doc.fillColor(mutedColor).fontSize(11).font('Helvetica-Oblique').text(`"${startup.tagline}"`);
  }
  doc.moveDown(0.3);

  // Metadata Grid
  doc.fillColor('#475569').fontSize(9).font('Helvetica');
  doc.text(`Industry: ${startup.industry}   |   Stage: ${startup.stage}   |   Model: ${startup.revenue_model || 'SaaS'}`);
  doc.moveDown(0.6);

  // Problem & Solution
  addSubHeader('Problem Statement:');
  addBodyText(startup.problem_statement);

  addSubHeader('Proposed Solution:');
  addBodyText(startup.solution_statement);

  addSubHeader('Target Customer Persona:');
  addBodyText(startup.target_customer);

  // ─── OVERALL READINESS SCORE ───
  addSectionHeader('1. Executive Startup Readiness Benchmark');
  const readinessScore = readiness?.overallScore ?? 'N/A';
  const stageLabel = readiness?.stageLabel ?? 'Unassessed';
  
  doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text(`Overall Readiness Score: ${readinessScore} / 100`);
  doc.fillColor(mutedColor).fontSize(10).font('Helvetica-Bold').text(`Status: ${stageLabel}`);
  doc.moveDown(0.4);

  if (readiness?.modules) {
    readiness.modules.forEach((m) => {
      const scoreText = m.completed ? `${m.score} / 100` : 'Not Completed Yet';
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text(`• ${m.name}: `, { continued: true });
      doc.font('Helvetica').fillColor(m.completed ? '#059669' : '#94a3b8').text(scoreText);
    });
  }
  doc.moveDown(0.5);

  // ─── 2. AI IDEA VALIDATION ───
  addSectionHeader('2. AI Idea Validation & SWOT Analysis');
  if (validation) {
    doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text(
      `Viability Score: ${validation.overall_score || 0} / 100   |   Verdict: ${validation.verdict || 'N/A'}`
    );
    doc.moveDown(0.3);

    const report = validation.full_report || {};
    if (report.executiveSummary) {
      addBodyText(report.executiveSummary);
    }

    const swot = report.swot || validation.swot_analysis;
    if (swot) {
      addSubHeader('SWOT Highlights:');
      if (swot.strengths?.length) doc.fillColor('#059669').fontSize(8.5).font('Helvetica').text(`Strengths: ${swot.strengths.slice(0, 3).join('; ')}`);
      if (swot.weaknesses?.length) doc.fillColor('#d97706').fontSize(8.5).font('Helvetica').text(`Weaknesses: ${swot.weaknesses.slice(0, 3).join('; ')}`);
      if (swot.opportunities?.length) doc.fillColor('#0284c7').fontSize(8.5).font('Helvetica').text(`Opportunities: ${swot.opportunities.slice(0, 3).join('; ')}`);
      if (swot.threats?.length) doc.fillColor('#dc2626').fontSize(8.5).font('Helvetica').text(`Threats: ${swot.threats.slice(0, 3).join('; ')}`);
      doc.moveDown(0.4);
    }
  } else {
    addBodyText('AI Idea Validation has not been performed for this venture yet.');
  }

  // Check page height before market section
  if (doc.y > 650) doc.addPage();

  // ─── 3. MARKET RESEARCH & TAM/SAM/SOM ───
  addSectionHeader('3. Market Research & Competitor Benchmarking');
  if (marketResearch) {
    const report = marketResearch.full_report || {};
    if (report.industryOverview) {
      addSubHeader('Industry Landscape:');
      addBodyText(report.industryOverview);
    }

    // TAM SAM SOM table/box (Dynamic Currency)
    const tam = targetCurrency === 'INR' && report.tamSamSom?.tamFormatted
      ? report.tamSamSom.tamFormatted
      : fmtCompact(marketResearch.tam_usd || report.tamSamSom?.tamInr || 500000000000);
    const sam = targetCurrency === 'INR' && report.tamSamSom?.samFormatted
      ? report.tamSamSom.samFormatted
      : fmtCompact(marketResearch.sam_usd || report.tamSamSom?.samInr || 125000000000);
    const som = targetCurrency === 'INR' && report.tamSamSom?.somFormatted
      ? report.tamSamSom.somFormatted
      : fmtCompact(marketResearch.som_usd || report.tamSamSom?.somInr || 5000000000);

    addSubHeader(`Addressable Market Sizing Model (Estimated in ${targetCurrency} / ${targetSymbol}):`);
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text(
      `TAM: ${tam}   |   SAM: ${sam}   |   SOM: ${som} (${targetCurrency})`
    );
    if (marketResearch.tam_explanation) {
      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica-Oblique').text(`Methodology: ${marketResearch.tam_explanation}`);
    }
    doc.moveDown(0.4);

    // Competitors
    if (competitors && competitors.length > 0) {
      addSubHeader('Competitor Landscape:');
      competitors.slice(0, 4).forEach((c) => {
        doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(`• ${c.competitor_name} (${c.market_tier || 'Direct'}): `, { continued: true });
        doc.font('Helvetica').fillColor('#475569').text(`Differentiator: ${c.differentiator || c.strengths || 'N/A'}`);
      });
      doc.moveDown(0.4);
    }
  } else {
    addBodyText('Market Research data is pending for this venture.');
  }

  // Check page height before finance
  if (doc.y > 650) doc.addPage();

  // ─── 4. FINANCIAL PROJECTIONS & UNIT ECONOMICS ───
  addSectionHeader(`4. Deterministic Financial Projections & Unit Economics (${targetCurrency} / ${targetSymbol})`);
  if (financialModel) {
    const results = financialModel.results || financialModel;
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica');
    doc.text(`Pricing: ${fmt(results.price || 2999)}   |   CAC: ${fmt(results.cac || 4500)}   |   Net LTV: ${fmt(results.netLtv || 20000)}   |   LTV/CAC: ${results.ltvCacRatio || 4.2}x`);
    doc.text(`Fixed Operating Monthly Costs: ${fmt(results.fixedMonthlyCosts || 240000)}   |   Break-Even Volume: ${results.breakEvenCustomers ? `${results.breakEvenCustomers} customers (${fmt(results.breakEvenRevenue)}/mo)` : 'N/A'}`);
    doc.moveDown(0.4);

    if (results.forecasts?.realistic) {
      const m12 = results.forecasts.realistic[11];
      if (m12) {
        addSubHeader(`12-Month Realistic Milestone Projections (${targetCurrency} / ${targetSymbol}):`);
        doc.text(`Month 12 Customers: ${m12.customers.toLocaleString(targetCurrency === 'INR' ? 'en-IN' : 'en-US')}   |   Monthly Revenue: ${fmt(m12.revenue)}   |   Net Profit: ${fmt(m12.netProfit)} (${m12.profitMargin}%)`);
      }
    }
  } else {
    addBodyText('Financial simulation model has not been configured yet.');
  }

  // ─── 5. INVESTOR SIMULATION & PITCH EVALUATION ───
  addSectionHeader('5. AI Investor & Pitch Evaluation Summary');
  if (investorSession) {
    doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold').text(`Investor Partner: ${investorSession.persona_name || 'VC Interview'}`);
    doc.fillColor(primaryColor).fontSize(9).font('Helvetica').text(`Session Score: ${investorSession.evaluation_score || 'N/A'}/100   |   Verdict: ${investorSession.verdict || 'Reviewed'}`);
    if (investorSession.feedback_summary) {
      addBodyText(investorSession.feedback_summary);
    }
  } else {
    addBodyText('No simulated investor sessions completed yet.');
  }

  if (pitchEvaluation) {
    doc.moveDown(0.3);
    addSubHeader(`Pitch Evaluation Score: ${pitchEvaluation.overall_score || 0}/100`);
    if (pitchEvaluation.actionable_feedback?.storytellingTips?.length) {
      doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text(`Key Pitch Tip: ${pitchEvaluation.actionable_feedback.storytellingTips[0]}`);
    }
  }

  // ─── FOOTER & DISCLAIMER ───
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text(
      'DISCLAIMER: VentureMind AI simulations and projections are computational heuristics and advisory models. They do not constitute guaranteed investment offers, legal counsel, or financial audits.',
      45,
      800,
      { align: 'center', width: 505 }
    );
    doc.text(`Page ${i + 1} of ${range.count}`, 45, 812, { align: 'center', width: 505 });
  }

  doc.end();
  return doc;
};
