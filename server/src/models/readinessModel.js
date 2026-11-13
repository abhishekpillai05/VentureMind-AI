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

  // Recalculate deterministic readiness
  const calculation = calculateStartupReadiness({
    validationScore: existing?.validation_score,
    marketScore: existing?.market_score,
    financialScore: existing?.financial_score,
    investorScore: existing?.investor_score,
    pitchScore: existing?.pitch_score,
  });

  const sql = `
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
      action_checklist = COALESCE(VALUES(action_checklist), action_checklist),
      updated_at = CURRENT_TIMESTAMP
  `;

  await pool.execute(sql, [
    startup_id,
    calculation.overallScore,
    existing?.validation_score || 0,
    existing?.market_score || 0,
    existing?.financial_score || 0,
    existing?.investor_score || 0,
    existing?.pitch_score || 0,
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
  await pool.execute(
    `INSERT IGNORE INTO readiness_scores (startup_id) VALUES (?)`,
    [startup_id]
  );

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
