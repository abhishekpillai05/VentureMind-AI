import { getPool } from '../config/db.js';
import { calculateStartupReadiness } from '../services/readinessCalculationService.js';

export const getReadinessScoreByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM readiness_scores WHERE startup_id = ?`,
    [startup_id]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    breakdown: typeof r.breakdown === 'string' ? JSON.parse(r.breakdown) : r.breakdown,
    action_checklist: typeof r.action_checklist === 'string' ? JSON.parse(r.action_checklist) : r.action_checklist,
  };
};

export const syncAndRecalculateReadiness = async (startup_id) => {
  const pool = getPool();

  // Fetch current row or initialize
  const existing = await getReadinessScoreByStartup(startup_id);

  // Check actual completion states from tables to accurately differentiate completed vs pending modules
  const [validations] = await pool.execute(
    'SELECT overall_score, viability_score FROM idea_validations WHERE startup_id = ? ORDER BY id DESC LIMIT 1',
    [startup_id]
  ).catch(() => [[]]);
  const [markets] = await pool.execute(
    'SELECT id FROM market_research WHERE startup_id = ? ORDER BY id DESC LIMIT 1',
    [startup_id]
  ).catch(() => [[]]);
  const [finances] = await pool.execute(
    'SELECT id FROM financial_models WHERE startup_id = ? ORDER BY id DESC LIMIT 1',
    [startup_id]
  ).catch(() => [[]]);
  const [investors] = await pool.execute(
    "SELECT evaluation_score FROM investor_sessions WHERE startup_id = ? AND status = 'completed' ORDER BY id DESC LIMIT 1",
    [startup_id]
  ).catch(() => [[]]);
  const [pitches] = await pool.execute(
    'SELECT overall_score FROM pitch_evaluations WHERE startup_id = ? ORDER BY id DESC LIMIT 1',
    [startup_id]
  ).catch(() => [[]]);

  const hasValidation = validations && validations.length > 0;
  const hasMarket = markets && markets.length > 0;
  const hasFinance = finances && finances.length > 0;
  const hasInvestor = investors && investors.length > 0;
  const hasPitch = pitches && pitches.length > 0;

  const validationScore = hasValidation
    ? (validations[0].overall_score || validations[0].viability_score || existing?.validation_score || 70)
    : null;
  const marketScore = hasMarket ? (existing?.market_score || 70) : null;
  const financialScore = hasFinance ? (existing?.financial_score || 70) : null;
  const investorScore = hasInvestor ? (investors[0].evaluation_score || existing?.investor_score || 70) : null;
  const pitchScore = hasPitch ? (pitches[0].overall_score || existing?.pitch_score || 70) : null;

  // Recalculate deterministic readiness
  const calculation = calculateStartupReadiness({
    validationScore,
    marketScore,
    financialScore,
    investorScore,
    pitchScore,
  });

  let sql;
  if (pool.isPostgres) {
    sql = `
      INSERT INTO readiness_scores 
        (startup_id, overall_score, validation_score, market_score, financial_score, investor_score, pitch_score, breakdown, action_checklist)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (startup_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        validation_score = EXCLUDED.validation_score,
        market_score = EXCLUDED.market_score,
        financial_score = EXCLUDED.financial_score,
        investor_score = EXCLUDED.investor_score,
        pitch_score = EXCLUDED.pitch_score,
        breakdown = EXCLUDED.breakdown,
        action_checklist = COALESCE(EXCLUDED.action_checklist, readiness_scores.action_checklist),
        updated_at = CURRENT_TIMESTAMP
    `;
  } else {
    sql = `
      INSERT INTO readiness_scores 
        (startup_id, overall_score, validation_score, market_score, financial_score, investor_score, pitch_score, breakdown, action_checklist)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        overall_score = VALUES(overall_score),
        validation_score = VALUES(validation_score),
        market_score = VALUES(market_score),
        financial_score = VALUES(financial_score),
        investor_score = VALUES(investor_score),
        pitch_score = VALUES(pitch_score),
        breakdown = VALUES(breakdown),
        action_checklist = COALESCE(VALUES(action_checklist), readiness_scores.action_checklist),
        updated_at = CURRENT_TIMESTAMP
    `;
  }

  await pool.execute(sql, [
    startup_id,
    calculation.overallScore,
    validationScore ?? 0,
    marketScore ?? 0,
    financialScore ?? 0,
    investorScore ?? 0,
    pitchScore ?? 0,
    JSON.stringify(calculation),
    existing?.action_checklist ? JSON.stringify(existing.action_checklist) : null,
  ]);

  return calculation;
};

export const updateModuleReadinessScore = async ({
  startup_id,
  moduleType, // 'validation' | 'market' | 'financial' | 'investor' | 'pitch'
  score,
  checklist = null,
}) => {
  const pool = getPool();
  // Ensure row exists
  if (pool.isPostgres) {
    await pool.execute(
      `INSERT INTO readiness_scores (startup_id) VALUES (?) ON CONFLICT (startup_id) DO NOTHING`,
      [startup_id]
    );
  } else {
    await pool.execute(
      `INSERT IGNORE INTO readiness_scores (startup_id) VALUES (?)`,
      [startup_id]
    );
  }

  const columnMap = {
    validation: 'validation_score',
    market: 'market_score',
    financial: 'financial_score',
    investor: 'investor_score',
    pitch: 'pitch_score',
  };

  const col = columnMap[moduleType];
  if (col) {
    if (checklist) {
      await pool.execute(
        `UPDATE readiness_scores SET ${col} = ?, action_checklist = ? WHERE startup_id = ?`,
        [score, JSON.stringify(checklist), startup_id]
      );
    } else {
      await pool.execute(
        `UPDATE readiness_scores SET ${col} = ? WHERE startup_id = ?`,
        [score, startup_id]
      );
    }
  }

  // Recalculate overall score with pro-rated weights
  return await syncAndRecalculateReadiness(startup_id);
};

export const upsertReadinessScore = async ({
  startup_id,
  overall_score,
  validation_score,
  action_checklist = null,
}) => {
  return await updateModuleReadinessScore({
    startup_id,
    moduleType: 'validation',
    score: validation_score || overall_score,
    checklist: action_checklist,
  });
};
