import PDFDocument from 'pdfkit';
import {
  formatCurrency,
  formatCompactCurrency,
  SYMBOLS,
} from '../utils/formatters.js';

/**
 * Enterprise-grade PDF Dossier Generator for VentureMind AI.
 * Strict full-width margin alignment (45pt left, 45pt right = 505pt content width).
 * Natural content flow with dynamic height calculation and zero trailing blank pages.
 */
export const generateStartupPDFReport = ({
  startup,
  founder = null,
  validation = null,
  marketResearch = null,
  competitors = [],
  financialModel = null,
  investorSession = null,
  activeSession = null,
  pitchEvaluation = null,
  readiness = null,
  userPreferences = null,
  rates = null,
}) => {
  const targetCurrency = userPreferences?.currency || 'INR';
  const targetSymbol = SYMBOLS[targetCurrency] || userPreferences?.currency_symbol || '₹';

  // Currency helpers
  const fmt = (amount, decimals = false) => formatCurrency(amount, targetCurrency, decimals, rates);
  const fmtCompact = (amount) => formatCompactCurrency(amount, targetCurrency, rates);

  // Exact page geometry constants
  const PAGE_WIDTH = 595.28;  // A4 Width (points)
  const PAGE_HEIGHT = 841.89; // A4 Height (points)
  const MARGIN_LEFT = 45;
  const MARGIN_RIGHT = 45;
  const MARGIN_TOP = 40;
  const MARGIN_BOTTOM = 45;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 505.28 pt
  const CONTENT_BOTTOM_LIMIT = PAGE_HEIGHT - 65; // ~776 pt (leaves clean buffer before footer)

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT },
    bufferPages: true,
    autoFirstPage: true,
  });

  // Strict Theme Colors
  const COLOR_NAVY = '#0f172a';       // Slate 900
  const COLOR_INDIGO = '#312e81';     // Indigo 900
  const COLOR_ACCENT = '#4338ca';     // Indigo 700
  const COLOR_TEXT_DARK = '#1e293b';  // Slate 800
  const COLOR_TEXT_BODY = '#334155';  // Slate 700
  const COLOR_TEXT_MUTED = '#64748b'; // Slate 500
  const COLOR_BORDER = '#cbd5e1';     // Slate 300
  const COLOR_BORDER_LIGHT = '#e2e8f0'; // Slate 200
  const COLOR_BG_LIGHT = '#f8fafc';   // Slate 50
  const COLOR_SUCCESS = '#059669';    // Emerald 600
  const COLOR_WARNING = '#d97706';    // Amber 600
  const COLOR_DANGER = '#dc2626';     // Rose 600

  // ─────────────────────────────────────────────────────────────
  // CORE LAYOUT HELPERS (Strict Left-Margin Enforcement)
  // ─────────────────────────────────────────────────────────────

  // Forces x position to left margin
  const resetX = () => {
    doc.x = MARGIN_LEFT;
  };

  // Check if needed block height exceeds printable area; add page if needed
  const checkPageBreak = (neededHeight) => {
    // If we are already at the top of a page, do not add another page
    if (doc.y <= MARGIN_TOP + 5) return;
    if (doc.y + neededHeight > CONTENT_BOTTOM_LIMIT) {
      doc.addPage();
      doc.x = MARGIN_LEFT;
      doc.y = MARGIN_TOP;
    }
  };

  // Safe multi-line text printing that guarantees full-width alignment
  const printText = (text, options = {}) => {
    if (!text) return;
    doc.x = MARGIN_LEFT;
    doc.text(text, {
      width: CONTENT_WIDTH,
      lineGap: 2.2,
      align: 'left',
      ...options,
    });
    resetX();
  };

  // Standard Section Header with full-width underline
  const renderSectionHeader = (number, title) => {
    checkPageBreak(44);
    doc.y += 10;
    resetX();
    doc.fillColor(COLOR_INDIGO).fontSize(12).font('Helvetica-Bold').text(
      `${number}. ${title}`,
      MARGIN_LEFT,
      doc.y,
      { width: CONTENT_WIDTH, lineBreak: false }
    );
    doc.y += 16;
    doc.strokeColor(COLOR_BORDER).lineWidth(0.75).moveTo(MARGIN_LEFT, doc.y).lineTo(MARGIN_LEFT + CONTENT_WIDTH, doc.y).stroke();
    doc.y += 8;
    resetX();
  };

  // Subheader
  const renderSubHeader = (title) => {
    checkPageBreak(24);
    resetX();
    doc.fillColor(COLOR_NAVY).fontSize(9.5).font('Helvetica-Bold').text(
      title,
      MARGIN_LEFT,
      doc.y,
      { width: CONTENT_WIDTH }
    );
    doc.y += 3;
    resetX();
  };

  // Status / Pending Notice Card
  const renderPendingCard = (moduleName, description) => {
    checkPageBreak(42);
    resetX();
    const cardY = doc.y;
    doc.rect(MARGIN_LEFT, cardY, CONTENT_WIDTH, 38).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER_LIGHT);
    doc.fillColor(COLOR_TEXT_MUTED).fontSize(8).font('Helvetica-Bold').text(
      `STATUS: PENDING ${moduleName.toUpperCase()} ASSESSMENT`,
      MARGIN_LEFT + 10,
      cardY + 8,
      { width: CONTENT_WIDTH - 20, lineBreak: false }
    );
    doc.fillColor(COLOR_TEXT_BODY).fontSize(7.5).font('Helvetica').text(
      description,
      MARGIN_LEFT + 10,
      cardY + 21,
      { width: CONTENT_WIDTH - 20, lineBreak: false }
    );
    doc.y = cardY + 44;
    resetX();
  };

  // ─────────────────────────────────────────────────────────────
  // 1. COVER BANNER & STARTUP IDENTITY
  // ─────────────────────────────────────────────────────────────
  resetX();
  doc.y = MARGIN_TOP;

  // Header Banner Box (Full width)
  const bannerY = doc.y;
  doc.rect(MARGIN_LEFT, bannerY, CONTENT_WIDTH, 68).fill(COLOR_NAVY);

  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(
    'VENTUREMIND AI',
    MARGIN_LEFT + 14,
    bannerY + 12,
    { width: CONTENT_WIDTH - 28, lineBreak: false }
  );
  doc.fillColor('#a5b4fc').fontSize(8.5).font('Helvetica').text(
    'Comprehensive Executive Startup Dossier & Strategic Simulation Report',
    MARGIN_LEFT + 14,
    bannerY + 32,
    { width: CONTENT_WIDTH - 28, lineBreak: false }
  );

  const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text(
    `Report Date: ${formattedDate}   |   Currency Preference: ${targetCurrency} (${targetSymbol})   |   ID: VM-${startup.id || 'REF'}-${Date.now().toString().slice(-6)}`,
    MARGIN_LEFT + 14,
    bannerY + 48,
    { width: CONTENT_WIDTH - 28, lineBreak: false }
  );

  doc.y = bannerY + 76;
  resetX();

  // Startup Name & Tagline
  doc.fillColor(COLOR_NAVY).fontSize(16).font('Helvetica-Bold');
  printText(startup.name || 'Startup Venture');
  doc.y += 2;

  if (startup.tagline) {
    doc.fillColor(COLOR_TEXT_MUTED).fontSize(9.5).font('Helvetica-Oblique');
    printText(`"${startup.tagline}"`);
    doc.y += 3;
  }

  // Metadata Bar (4 Equal Columns across 505pt)
  const metaY = doc.y;
  doc.rect(MARGIN_LEFT, metaY, CONTENT_WIDTH, 22).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER_LIGHT);
  doc.fillColor(COLOR_TEXT_DARK).fontSize(8).font('Helvetica-Bold');

  const colW = CONTENT_WIDTH / 4;
  doc.text(`Sector: ${startup.industry || 'General'}`, MARGIN_LEFT + 8, metaY + 6, { width: colW - 12, lineBreak: false });
  doc.text(`Stage: ${startup.stage || 'Idea'}`, MARGIN_LEFT + colW + 4, metaY + 6, { width: colW - 12, lineBreak: false });
  doc.text(`Model: ${startup.revenue_model || 'SaaS'}`, MARGIN_LEFT + (colW * 2) + 4, metaY + 6, { width: colW - 12, lineBreak: false });
  const founderName = founder?.full_name ? `Founder: ${founder.full_name}` : 'Confidential';
  doc.text(founderName, MARGIN_LEFT + (colW * 3) + 4, metaY + 6, { width: colW - 12, lineBreak: false });

  doc.y = metaY + 28;
  resetX();

  // Problem & Solution Executive Cards (Full Width Stack)
  const probText = startup.problem_statement || 'N/A';
  const solText = startup.solution_statement || 'N/A';

  // Problem Callout
  const probHeight = Math.max(38, doc.heightOfString(probText, { width: CONTENT_WIDTH - 20, fontSize: 8 }) + 20);
  checkPageBreak(probHeight + 6);
  const probY = doc.y;
  doc.rect(MARGIN_LEFT, probY, CONTENT_WIDTH, probHeight).fillAndStroke('#fff5f5', '#fed7d7');
  doc.fillColor(COLOR_DANGER).fontSize(7.5).font('Helvetica-Bold').text(
    'CORE PROBLEM STATEMENT',
    MARGIN_LEFT + 10,
    probY + 6,
    { width: CONTENT_WIDTH - 20, lineBreak: false }
  );
  doc.fillColor(COLOR_TEXT_DARK).fontSize(8).font('Helvetica').text(
    probText,
    MARGIN_LEFT + 10,
    probY + 18,
    { width: CONTENT_WIDTH - 20 }
  );
  doc.y = probY + probHeight + 6;
  resetX();

  // Solution Callout
  const solHeight = Math.max(38, doc.heightOfString(solText, { width: CONTENT_WIDTH - 20, fontSize: 8 }) + 20);
  checkPageBreak(solHeight + 8);
  const solY = doc.y;
  doc.rect(MARGIN_LEFT, solY, CONTENT_WIDTH, solHeight).fillAndStroke('#f0fdf4', '#bbf7d0');
  doc.fillColor(COLOR_SUCCESS).fontSize(7.5).font('Helvetica-Bold').text(
    'PROPOSED VALUE PROPOSITION & SOLUTION',
    MARGIN_LEFT + 10,
    solY + 6,
    { width: CONTENT_WIDTH - 20, lineBreak: false }
  );
  doc.fillColor(COLOR_TEXT_DARK).fontSize(8).font('Helvetica').text(
    solText,
    MARGIN_LEFT + 10,
    solY + 18,
    { width: CONTENT_WIDTH - 20 }
  );
  doc.y = solY + solHeight + 8;
  resetX();

  // ─────────────────────────────────────────────────────────────
  // 1. EXECUTIVE STARTUP READINESS BENCHMARK
  // ─────────────────────────────────────────────────────────────
  renderSectionHeader('1', 'Executive Startup Readiness Benchmark');

  const readinessScore = readiness?.overallScore ?? 0;
  const stageLabel = readiness?.stageLabel ?? 'Early Stage (Unassessed)';
  const completedCount = readiness?.completedCount ?? (readiness?.modules?.filter(m => m.completed)?.length || 0);

  // Overall Score Highlight Card (Full Width)
  checkPageBreak(44);
  const scoreCardY = doc.y;
  doc.rect(MARGIN_LEFT, scoreCardY, CONTENT_WIDTH, 36).fillAndStroke('#f0f4ff', '#c7d2fe');

  doc.fillColor(COLOR_ACCENT).fontSize(13).font('Helvetica-Bold').text(
    `Readiness Score: ${readinessScore} / 100`,
    MARGIN_LEFT + 12,
    scoreCardY + 9,
    { continued: true }
  );
  doc.fillColor(COLOR_TEXT_DARK).fontSize(9).font('Helvetica-Bold').text(
    `   |   Assessment Status: ${stageLabel}`
  );

  doc.fillColor(COLOR_TEXT_MUTED).fontSize(7.5).font('Helvetica').text(
    `${completedCount} of 5 simulation modules completed. Overall score is normalized across completed modules.`,
    MARGIN_LEFT + 12,
    scoreCardY + 23,
    { width: CONTENT_WIDTH - 24, lineBreak: false }
  );
  doc.y = scoreCardY + 42;
  resetX();

  // 5-Module Score Cards (5 Columns across 505pt)
  if (readiness?.modules && readiness.modules.length > 0) {
    checkPageBreak(38);
    const modGridY = doc.y;
    const cardGap = 4;
    const modW = (CONTENT_WIDTH - (cardGap * 4)) / 5; // ~97.8pt

    readiness.modules.forEach((mod, idx) => {
      const cardX = MARGIN_LEFT + (idx * (modW + cardGap));
      const isDone = mod.completed;
      const bg = isDone ? '#ffffff' : COLOR_BG_LIGHT;
      const border = isDone ? '#94a3b8' : COLOR_BORDER_LIGHT;

      doc.rect(cardX, modGridY, modW, 32).fillAndStroke(bg, border);

      doc.fillColor(COLOR_TEXT_MUTED).fontSize(6.5).font('Helvetica-Bold').text(
        mod.name.toUpperCase(),
        cardX + 2,
        modGridY + 5,
        { width: modW - 4, align: 'center', lineBreak: false }
      );

      if (isDone) {
        doc.fillColor(COLOR_SUCCESS).fontSize(9.5).font('Helvetica-Bold').text(
          `${mod.score}/100`,
          cardX + 2,
          modGridY + 16,
          { width: modW - 4, align: 'center', lineBreak: false }
        );
      } else {
        doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text(
          'Pending',
          cardX + 2,
          modGridY + 17,
          { width: modW - 4, align: 'center', lineBreak: false }
        );
      }
    });

    doc.y = modGridY + 38;
    resetX();
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AI IDEA VALIDATION & STRATEGIC SWOT ANALYSIS
  // ─────────────────────────────────────────────────────────────
  renderSectionHeader('2', 'AI Idea Validation & Strategic Analysis');

  if (validation) {
    const valScore = validation.overall_score || validation.viability_score || 0;
    const verdict = validation.verdict || 'Reviewed';
    const report = validation.full_report || {};

    checkPageBreak(30);
    resetX();
    doc.fillColor(COLOR_NAVY).fontSize(9).font('Helvetica-Bold').text(
      'Viability Benchmark: ',
      { continued: true }
    );
    doc.fillColor(COLOR_ACCENT).text(`${valScore} / 100`, { continued: true });
    doc.fillColor(COLOR_TEXT_MUTED).font('Helvetica').text('   |   Strategic Verdict: ', { continued: true });
    doc.fillColor(COLOR_NAVY).font('Helvetica-Bold').text(verdict);
    doc.y += 4;
    resetX();

    if (report.executiveSummary) {
      doc.fillColor(COLOR_TEXT_BODY).fontSize(8.5).font('Helvetica');
      printText(report.executiveSummary);
      doc.y += 6;
    }

    // SWOT Analysis (Structured 4-Quadrant List across Full Width)
    const swot = report.swot || validation.swot_analysis;
    if (swot && (swot.strengths?.length || swot.weaknesses?.length || swot.opportunities?.length || swot.threats?.length)) {
      renderSubHeader('Strategic SWOT Matrix:');

      const swotItems = [
        { label: 'STRENGTHS', items: swot.strengths || [], color: COLOR_SUCCESS, bg: '#f0fdf4', border: '#bbf7d0' },
        { label: 'WEAKNESSES', items: swot.weaknesses || [], color: COLOR_WARNING, bg: '#fffbeb', border: '#fde68a' },
        { label: 'OPPORTUNITIES', items: swot.opportunities || [], color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
        { label: 'THREATS', items: swot.threats || [], color: COLOR_DANGER, bg: '#fff1f2', border: '#fecdd3' },
      ];

      swotItems.forEach((quad) => {
        if (!quad.items.length) return;
        const textSummary = quad.items.slice(0, 3).join('; ');
        const cardH = Math.max(26, doc.heightOfString(textSummary, { width: CONTENT_WIDTH - 120, fontSize: 7.5 }) + 10);
        checkPageBreak(cardH + 4);

        const rowY = doc.y;
        doc.rect(MARGIN_LEFT, rowY, CONTENT_WIDTH, cardH).fillAndStroke(quad.bg, quad.border);

        doc.fillColor(quad.color).fontSize(7.5).font('Helvetica-Bold').text(
          quad.label,
          MARGIN_LEFT + 8,
          rowY + 6,
          { width: 95, lineBreak: false }
        );
        doc.fillColor(COLOR_TEXT_DARK).fontSize(7.5).font('Helvetica').text(
          textSummary,
          MARGIN_LEFT + 110,
          rowY + 6,
          { width: CONTENT_WIDTH - 120 }
        );

        doc.y = rowY + cardH + 4;
        resetX();
      });
      doc.y += 4;
    }
  } else {
    renderPendingCard(
      'Idea Validation',
      'AI Idea Validation has not yet been conducted for this venture. Run the Idea Validator module to model problem-solution fit and SWOT analysis.'
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. MARKET SIZING & COMPETITOR BENCHMARKING
  // ─────────────────────────────────────────────────────────────
  renderSectionHeader('3', `Market Sizing & Competitor Benchmarks (${targetCurrency} / ${targetSymbol})`);

  if (marketResearch) {
    const report = marketResearch.full_report || {};

    if (report.industryOverview) {
      renderSubHeader('Industry Overview & Market Dynamics:');
      doc.fillColor(COLOR_TEXT_BODY).fontSize(8.5).font('Helvetica');
      printText(report.industryOverview);
      doc.y += 6;
    }

    // TAM, SAM, SOM (Dynamically converted from base numbers)
    const rawTam = Number(marketResearch.tam_usd || report.tamSamSom?.tamInr || report.tamSamSom?.tamUsd || 0);
    const rawSam = Number(marketResearch.sam_usd || report.tamSamSom?.samInr || report.tamSamSom?.samUsd || 0);
    const rawSom = Number(marketResearch.som_usd || report.tamSamSom?.somInr || report.tamSamSom?.somUsd || 0);

    const tamFormatted = targetCurrency === 'INR' && report.tamSamSom?.tamFormatted
      ? report.tamSamSom.tamFormatted
      : (rawTam > 0 ? fmtCompact(rawTam) : 'N/A');
    const samFormatted = targetCurrency === 'INR' && report.tamSamSom?.samFormatted
      ? report.tamSamSom.samFormatted
      : (rawSam > 0 ? fmtCompact(rawSam) : 'N/A');
    const somFormatted = targetCurrency === 'INR' && report.tamSamSom?.somFormatted
      ? report.tamSamSom.somFormatted
      : (rawSom > 0 ? fmtCompact(rawSom) : 'N/A');

    renderSubHeader(`Addressable Market Sizing Model (Estimated in ${targetCurrency}):`);

    // 3 Cards across 505pt
    checkPageBreak(42);
    const tamY = doc.y;
    const cardGap = 6;
    const cardW = (CONTENT_WIDTH - (cardGap * 2)) / 3; // ~164pt

    const tamCards = [
      { label: 'TOTAL ADDRESSABLE (TAM)', val: tamFormatted, color: COLOR_ACCENT },
      { label: 'SERVICEABLE ADDRESSABLE (SAM)', val: samFormatted, color: COLOR_NAVY },
      { label: 'OBTAINABLE MARKET (SOM)', val: somFormatted, color: COLOR_SUCCESS },
    ];

    tamCards.forEach((c, idx) => {
      const cx = MARGIN_LEFT + (idx * (cardW + cardGap));
      doc.rect(cx, tamY, cardW, 36).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER_LIGHT);
      doc.fillColor(COLOR_TEXT_MUTED).fontSize(7).font('Helvetica-Bold').text(
        c.label,
        cx + 6,
        tamY + 6,
        { width: cardW - 12, lineBreak: false }
      );
      doc.fillColor(c.color).fontSize(10).font('Helvetica-Bold').text(
        c.val,
        cx + 6,
        tamY + 18,
        { width: cardW - 12, lineBreak: false }
      );
    });

    doc.y = tamY + 42;
    resetX();

    if (marketResearch.tam_explanation) {
      doc.fillColor(COLOR_TEXT_MUTED).fontSize(7.5).font('Helvetica-Oblique');
      printText(`Methodology: ${marketResearch.tam_explanation}`);
      doc.y += 4;
    }

    // Competitor Matrix Table
    if (competitors && competitors.length > 0) {
      renderSubHeader('Key Competitors & Category Positioning:');

      checkPageBreak(50);
      const compTableY = doc.y;
      doc.rect(MARGIN_LEFT, compTableY, CONTENT_WIDTH, 16).fill('#f1f5f9');
      doc.fillColor(COLOR_NAVY).fontSize(7.5).font('Helvetica-Bold');
      doc.text('Competitor', MARGIN_LEFT + 6, compTableY + 4, { width: 130, lineBreak: false });
      doc.text('Tier', MARGIN_LEFT + 140, compTableY + 4, { width: 60, lineBreak: false });
      doc.text('Key Differentiator / Value Proposition', MARGIN_LEFT + 205, compTableY + 4, { width: 295, lineBreak: false });

      let rowY = compTableY + 16;
      competitors.slice(0, 4).forEach((comp, idx) => {
        checkPageBreak(18);
        const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
        doc.rect(MARGIN_LEFT, rowY, CONTENT_WIDTH, 18).fillAndStroke(bg, '#f1f5f9');

        doc.fillColor(COLOR_TEXT_DARK).fontSize(7.5).font('Helvetica-Bold').text(
          comp.competitor_name || 'Competitor',
          MARGIN_LEFT + 6,
          rowY + 4,
          { width: 130, lineBreak: false }
        );
        doc.fillColor(COLOR_TEXT_MUTED).font('Helvetica').text(
          comp.market_tier || 'Direct',
          MARGIN_LEFT + 140,
          rowY + 4,
          { width: 60, lineBreak: false }
        );
        const diffText = comp.differentiator || comp.strengths || comp.pricing_info || 'Category alternative';
        doc.fillColor(COLOR_TEXT_BODY).text(
          diffText,
          MARGIN_LEFT + 205,
          rowY + 4,
          { width: 295, lineBreak: false, ellipsis: true }
        );
        rowY += 18;
      });

      doc.y = rowY + 6;
      resetX();
    }
  } else {
    renderPendingCard(
      'Market Research',
      'Market Research has not yet been executed for this venture. Run the Market Research module to model TAM/SAM/SOM and competitor benchmarks.'
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. FINANCIAL PROJECTIONS & UNIT ECONOMICS
  // ─────────────────────────────────────────────────────────────
  renderSectionHeader('4', `Deterministic Financial Projections & Unit Economics (${targetCurrency} / ${targetSymbol})`);

  if (financialModel) {
    const res = financialModel.results || financialModel;
    const modelName = financialModel.model_name || 'Baseline Financial Model';

    checkPageBreak(24);
    resetX();
    doc.fillColor(COLOR_NAVY).fontSize(9).font('Helvetica-Bold').text(
      'Scenario Model: ',
      { continued: true }
    );
    doc.fillColor(COLOR_ACCENT).text(modelName, { continued: true });
    doc.fillColor(COLOR_TEXT_MUTED).font('Helvetica').text(
      `   |   Pricing Model: ${financialModel.pricing_model || 'SaaS Subscription'}`
    );
    doc.y += 4;
    resetX();

    const priceVal = res.price ?? financialModel.default_price;
    const cacVal = res.cac ?? financialModel.cac;
    const ltvVal = res.netLtv ?? res.ltv ?? financialModel.ltv;
    const ltvCacVal = res.ltvCacRatio ?? (cacVal > 0 && ltvVal ? (ltvVal / cacVal).toFixed(1) : 'N/A');
    const paybackVal = res.paybackMonths ? `${res.paybackMonths} mo` : 'N/A';
    const burnVal = res.fixedMonthlyCosts ?? financialModel.monthly_burn_rate;
    const breakEvenCust = res.breakEvenCustomers ? `${res.breakEvenCustomers} customers` : 'N/A';
    const breakEvenRev = res.breakEvenRevenue ? fmt(res.breakEvenRevenue) : 'N/A';

    // 6-Metric Score Card Grid (3 Columns x 2 Rows across 505pt)
    checkPageBreak(72);
    const gridY = doc.y;
    const cardGap = 6;
    const colW3 = (CONTENT_WIDTH - (cardGap * 2)) / 3;
    const rowH = 32;

    const metrics = [
      { label: 'OFFERING PRICE', val: priceVal !== undefined ? fmt(priceVal) : 'N/A' },
      { label: 'CUSTOMER ACQUISITION (CAC)', val: cacVal !== undefined ? fmt(cacVal) : 'N/A' },
      { label: 'NET CUSTOMER LTV', val: ltvVal !== undefined ? fmt(ltvVal) : 'N/A' },
      { label: 'LTV / CAC RATIO', val: `${ltvCacVal}x`, highlight: true },
      { label: 'CAC PAYBACK PERIOD', val: paybackVal },
      { label: 'FIXED MONTHLY BURN', val: burnVal !== undefined ? fmt(burnVal) : 'N/A' },
    ];

    metrics.forEach((m, idx) => {
      const colIdx = idx % 3;
      const rowIdx = Math.floor(idx / 3);
      const cx = MARGIN_LEFT + colIdx * (colW3 + cardGap);
      const cy = gridY + rowIdx * (rowH + 4);

      doc.rect(cx, cy, colW3, rowH).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER_LIGHT);
      doc.fillColor(COLOR_TEXT_MUTED).fontSize(6.8).font('Helvetica-Bold').text(
        m.label,
        cx + 6,
        cy + 5,
        { width: colW3 - 12, lineBreak: false }
      );
      const valColor = m.highlight ? COLOR_ACCENT : COLOR_TEXT_DARK;
      doc.fillColor(valColor).fontSize(9.5).font('Helvetica-Bold').text(
        m.val,
        cx + 6,
        cy + 16,
        { width: colW3 - 12, lineBreak: false }
      );
    });

    doc.y = gridY + (rowH * 2) + 10;
    resetX();

    // Break-even callout
    doc.fillColor(COLOR_TEXT_BODY).fontSize(8).font('Helvetica-Bold').text(
      'Break-Even Threshold: ',
      { continued: true }
    );
    doc.font('Helvetica').fillColor(COLOR_NAVY).text(
      `${breakEvenCust} (${breakEvenRev}/month)`
    );
    doc.y += 6;
    resetX();

    // 12-Month Milestone Table (Full 505pt width)
    const forecasts = financialModel.scenarios || res.forecasts;
    const realistic = forecasts?.realistic || (Array.isArray(financialModel.projections_data) ? financialModel.projections_data : null);

    if (realistic && realistic.length > 0) {
      renderSubHeader(`12-Month Realistic Milestone Forecasts (${targetCurrency}):`);

      checkPageBreak(85);
      const fTableY = doc.y;
      doc.rect(MARGIN_LEFT, fTableY, CONTENT_WIDTH, 16).fill('#f1f5f9');
      doc.fillColor(COLOR_NAVY).fontSize(7.5).font('Helvetica-Bold');
      doc.text('Milestone', MARGIN_LEFT + 8, fTableY + 4, { width: 75 });
      doc.text('Customers', MARGIN_LEFT + 85, fTableY + 4, { width: 80, align: 'right' });
      doc.text('Monthly Revenue', MARGIN_LEFT + 175, fTableY + 4, { width: 110, align: 'right' });
      doc.text('Total Costs', MARGIN_LEFT + 295, fTableY + 4, { width: 100, align: 'right' });
      doc.text('Net Profit (Margin)', MARGIN_LEFT + 405, fTableY + 4, { width: 95, align: 'right' });

      const milestones = [0, 2, 5, 8, 11].filter(idx => idx < realistic.length);
      let fRowY = fTableY + 16;

      milestones.forEach((mIdx, rowNum) => {
        const m = realistic[mIdx];
        if (!m) return;
        checkPageBreak(16);
        const bg = rowNum % 2 === 0 ? '#ffffff' : '#fafafa';
        doc.rect(MARGIN_LEFT, fRowY, CONTENT_WIDTH, 16).fillAndStroke(bg, '#f1f5f9');

        const custFormatted = m.customers?.toLocaleString(targetCurrency === 'INR' ? 'en-IN' : 'en-US') || '0';
        const profitColor = (m.netProfit || 0) >= 0 ? COLOR_SUCCESS : COLOR_DANGER;

        doc.fillColor(COLOR_TEXT_DARK).fontSize(7.5).font('Helvetica-Bold').text(
          `Month ${mIdx + 1}`,
          MARGIN_LEFT + 8,
          fRowY + 4,
          { width: 75, lineBreak: false }
        );
        doc.fillColor(COLOR_TEXT_BODY).font('Helvetica').text(
          custFormatted,
          MARGIN_LEFT + 85,
          fRowY + 4,
          { width: 80, align: 'right', lineBreak: false }
        );
        doc.text(
          fmt(m.revenue),
          MARGIN_LEFT + 175,
          fRowY + 4,
          { width: 110, align: 'right', lineBreak: false }
        );
        doc.text(
          fmt(m.totalExpenses),
          MARGIN_LEFT + 295,
          fRowY + 4,
          { width: 100, align: 'right', lineBreak: false }
        );
        doc.fillColor(profitColor).font('Helvetica-Bold').text(
          `${fmt(m.netProfit)} (${m.profitMargin || 0}%)`,
          MARGIN_LEFT + 405,
          fRowY + 4,
          { width: 95, align: 'right', lineBreak: false }
        );

        fRowY += 16;
      });

      doc.y = fRowY + 6;
      resetX();
    }

    if (res.aiCritique?.commentary) {
      renderSubHeader('Strategic Financial Advisory Note:');
      doc.fillColor(COLOR_TEXT_BODY).fontSize(8).font('Helvetica');
      printText(res.aiCritique.commentary);
      doc.y += 4;
    }
  } else {
    renderPendingCard(
      'Financial Simulation',
      'Financial simulation has not yet been saved for this venture. Run the Financial Simulator to model pricing, CAC/LTV, monthly burn, and break-even customer volume.'
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SIMULATED INVESTOR DIALOGUE & PITCH EVALUATION
  // ─────────────────────────────────────────────────────────────
  renderSectionHeader('5', 'Simulated Investor Dialogue & Pitch Evaluation');

  // 5A. Investor Simulation Debrief
  if (investorSession) {
    renderSubHeader('Simulated Investor Committee Review:');
    checkPageBreak(50);

    const invY = doc.y;
    doc.rect(MARGIN_LEFT, invY, CONTENT_WIDTH, 44).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER_LIGHT);

    doc.fillColor(COLOR_NAVY).fontSize(9).font('Helvetica-Bold').text(
      `Investor Partner: ${investorSession.persona_name || 'Venture Partner'}`,
      MARGIN_LEFT + 10,
      invY + 7,
      { width: CONTENT_WIDTH - 20, lineBreak: false }
    );

    const verdictLabel = investorSession.verdict === 'term_sheet' ? 'Term Sheet Offered'
      : investorSession.verdict === 'follow_up' ? 'Follow-Up Due Diligence'
      : investorSession.verdict === 'passed' ? 'Passed / Rejection'
      : 'Session Completed';

    const verdictColor = investorSession.verdict === 'term_sheet' ? COLOR_SUCCESS
      : investorSession.verdict === 'follow_up' ? COLOR_ACCENT
      : COLOR_WARNING;

    doc.fillColor(verdictColor).fontSize(8).font('Helvetica-Bold').text(
      `Verdict: ${verdictLabel}   |   Debrief Score: ${investorSession.evaluation_score || 'N/A'}/100`,
      MARGIN_LEFT + 10,
      invY + 19,
      { width: CONTENT_WIDTH - 20, lineBreak: false }
    );

    if (investorSession.feedback_summary) {
      doc.fillColor(COLOR_TEXT_BODY).fontSize(7.5).font('Helvetica').text(
        investorSession.feedback_summary,
        MARGIN_LEFT + 10,
        invY + 30,
        { width: CONTENT_WIDTH - 20, lineBreak: false, ellipsis: true }
      );
    }

    doc.y = invY + 50;
    resetX();
  } else if (activeSession) {
    renderPendingCard(
      'Investor Session',
      `An investor session with ${activeSession.persona_name || 'an AI investor'} is active. Complete the debrief to generate score and verdict.`
    );
  } else {
    renderPendingCard(
      'Investor Simulation',
      'No simulated investor sessions completed yet. Use the Investor Simulation module to pitch against AI investor personas.'
    );
  }

  // 5B. Pitch Evaluation
  if (pitchEvaluation) {
    renderSubHeader(`AI Pitch Transcript Evaluation (Score: ${pitchEvaluation.overall_score || 0}/100):`);

    const cat = pitchEvaluation.category_scores || {};
    const catItems = [
      { name: 'Problem Clarity', score: cat.problemClarity ?? pitchEvaluation.problem_clarity_score },
      { name: 'Market Opportunity', score: cat.marketOpportunity ?? pitchEvaluation.market_opportunity_score },
      { name: 'Business Model', score: cat.businessModel ?? pitchEvaluation.business_model_score },
      { name: 'Defensibility', score: cat.defensibility ?? pitchEvaluation.defensibility_score },
      { name: 'Delivery/Story', score: cat.presentation ?? pitchEvaluation.presentation_score },
    ].filter(c => c.score !== undefined && c.score !== null);

    if (catItems.length > 0) {
      checkPageBreak(32);
      const pGridY = doc.y;
      const cardGap = 4;
      const cW = (CONTENT_WIDTH - (cardGap * (catItems.length - 1))) / catItems.length;

      catItems.forEach((c, idx) => {
        const cx = MARGIN_LEFT + (idx * (cW + cardGap));
        doc.rect(cx, pGridY, cW, 26).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER_LIGHT);
        doc.fillColor(COLOR_TEXT_MUTED).fontSize(6).font('Helvetica-Bold').text(
          c.name.toUpperCase(),
          cx + 2,
          pGridY + 4,
          { width: cW - 4, align: 'center', lineBreak: false }
        );
        doc.fillColor(COLOR_NAVY).fontSize(8.5).font('Helvetica-Bold').text(
          `${c.score}/100`,
          cx + 2,
          pGridY + 14,
          { width: cW - 4, align: 'center', lineBreak: false }
        );
      });

      doc.y = pGridY + 32;
      resetX();
    }

    const feedback = pitchEvaluation.actionable_feedback || {};
    if (feedback.storytellingTips && feedback.storytellingTips.length > 0) {
      doc.fillColor(COLOR_TEXT_MUTED).fontSize(7.5).font('Helvetica-Bold').text(
        'Storytelling Advice: ',
        { continued: true }
      );
      doc.fillColor(COLOR_TEXT_BODY).font('Helvetica').text(feedback.storytellingTips[0]);
      doc.y += 4;
      resetX();
    }
  } else {
    renderPendingCard(
      'Pitch Evaluation',
      'No AI pitch evaluation has been performed yet. Paste your pitch deck transcript into the Pitch Evaluation module for scoring.'
    );
  }

  // ─────────────────────────────────────────────────────────────
  // FOOTER & EXACT PAGE COUNT (Zero Trailing Blank Pages)
  // ─────────────────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  const totalPages = range.count;

  // Crucial: Neuter doc.addPage during the footer pass so PDFKit can NEVER spawn extra pages!
  doc.addPage = () => doc;

  for (let i = range.start; i < range.start + totalPages; i++) {
    doc.switchToPage(i);

    // Crucial: Set page margins.bottom to 0 while rendering footers so PDFKit's
    // internal y > height - margins.bottom check never triggers auto-pagination!
    doc.page.margins.bottom = 0;

    // Footer divider line
    doc.strokeColor(COLOR_BORDER_LIGHT).lineWidth(0.5).moveTo(MARGIN_LEFT, PAGE_HEIGHT - 38).lineTo(MARGIN_LEFT + CONTENT_WIDTH, PAGE_HEIGHT - 38).stroke();

    // Disclaimer text
    doc.fillColor('#94a3b8').fontSize(6.5).font('Helvetica').text(
      'CONFIDENTIAL & PROPRIETARY — Generated by VentureMind AI. Simulations and projections are computational heuristics and do not constitute certified legal, financial, or audit advice.',
      MARGIN_LEFT,
      PAGE_HEIGHT - 30,
      { align: 'center', width: CONTENT_WIDTH, lineBreak: false }
    );

    // Page Number
    doc.fillColor(COLOR_TEXT_MUTED).fontSize(7.5).font('Helvetica-Bold').text(
      `Page ${i + 1} of ${totalPages}`,
      MARGIN_LEFT,
      PAGE_HEIGHT - 20,
      { align: 'center', width: CONTENT_WIDTH, lineBreak: false }
    );
  }

  doc.end();
  return doc;
};

export default {
  generateStartupPDFReport,
};
