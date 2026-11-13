import { getPool } from '../config/db.js';

export const savePitchEvaluation = async ({
  startup_id,
  pitch_transcript,
  problem_clarity_score = 0,
  market_opportunity_score = 0,
  business_model_score = 0,
  defensibility_score = 0,
  presentation_score = 0,
  overall_score = 0,
  category_scores = null,
  pitch_strengths = null,
  pitch_weaknesses = null,
  missing_information = null,
  improved_pitch = null,
  full_report = null,
  actionable_feedback = {},
}) => {
  const pool = getPool();
  const [res] = await pool.execute(
    `INSERT INTO pitch_evaluations 
     (startup_id, pitch_transcript, problem_clarity_score, market_opportunity_score, business_model_score, defensibility_score, presentation_score, overall_score, category_scores, pitch_strengths, pitch_weaknesses, missing_information, improved_pitch, full_report, actionable_feedback)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      startup_id,
      pitch_transcript,
      problem_clarity_score,
      market_opportunity_score,
      business_model_score,
      defensibility_score,
      presentation_score,
      overall_score,
      category_scores ? JSON.stringify(category_scores) : null,
      pitch_strengths ? JSON.stringify(pitch_strengths) : null,
      pitch_weaknesses ? JSON.stringify(pitch_weaknesses) : null,
      missing_information ? JSON.stringify(missing_information) : null,
      improved_pitch,
      full_report ? JSON.stringify(full_report) : null,
      JSON.stringify(actionable_feedback || {}),
    ]
  );
  return { id: res.insertId };
};

export const getLatestPitchEvaluationByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM pitch_evaluations WHERE startup_id = ? ORDER BY id DESC LIMIT 1`,
    [startup_id]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    category_scores: typeof r.category_scores === 'string' ? JSON.parse(r.category_scores) : r.category_scores,
    pitch_strengths: typeof r.pitch_strengths === 'string' ? JSON.parse(r.pitch_strengths) : r.pitch_strengths,
    pitch_weaknesses: typeof r.pitch_weaknesses === 'string' ? JSON.parse(r.pitch_weaknesses) : r.pitch_weaknesses,
    missing_information: typeof r.missing_information === 'string' ? JSON.parse(r.missing_information) : r.missing_information,
    full_report: typeof r.full_report === 'string' ? JSON.parse(r.full_report) : r.full_report,
    actionable_feedback: typeof r.actionable_feedback === 'string' ? JSON.parse(r.actionable_feedback) : r.actionable_feedback,
  };
};

export const getPitchHistoryByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, startup_id, overall_score, created_at 
     FROM pitch_evaluations WHERE startup_id = ? ORDER BY id DESC`,
    [startup_id]
  );
  return rows;
};

export const getPitchEvaluationByIdAndStartup = async (evaluation_id, startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM pitch_evaluations WHERE id = ? AND startup_id = ?`,
    [evaluation_id, startup_id]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    category_scores: typeof r.category_scores === 'string' ? JSON.parse(r.category_scores) : r.category_scores,
    pitch_strengths: typeof r.pitch_strengths === 'string' ? JSON.parse(r.pitch_strengths) : r.pitch_strengths,
    pitch_weaknesses: typeof r.pitch_weaknesses === 'string' ? JSON.parse(r.pitch_weaknesses) : r.pitch_weaknesses,
    missing_information: typeof r.missing_information === 'string' ? JSON.parse(r.missing_information) : r.missing_information,
    full_report: typeof r.full_report === 'string' ? JSON.parse(r.full_report) : r.full_report,
    actionable_feedback: typeof r.actionable_feedback === 'string' ? JSON.parse(r.actionable_feedback) : r.actionable_feedback,
  };
};
