import { getPool } from '../config/db.js';

export const saveValidationRecord = async ({
  startup_id,
  full_report,
  overall_score,
  verdict,
  dimension_scores,
  problem_solution_fit,
  swot_analysis,
  target_audience,
  recommendations,
}) => {
  const pool = getPool();
  const sql = `
    INSERT INTO idea_validations
      (startup_id, problem_solution_fit, swot_analysis, target_audience, viability_score, overall_score, verdict, dimension_scores, full_report, recommendations)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    startup_id,
    JSON.stringify(problem_solution_fit),
    JSON.stringify(swot_analysis),
    JSON.stringify(target_audience),
    overall_score, // viability_score legacy alias
    overall_score,
    verdict,
    JSON.stringify(dimension_scores),
    JSON.stringify(full_report),
    JSON.stringify(recommendations),
  ]);

  return {
    id: result.insertId,
    startup_id,
    overall_score,
    verdict,
    dimension_scores,
    full_report,
    created_at: new Date(),
  };
};

export const getLatestValidationByStartup = async (startupId) => {
  const pool = getPool();
  const sql = `
    SELECT *
    FROM idea_validations
    WHERE startup_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [startupId]);
  if (!rows[0]) return null;

  const row = rows[0];
  return {
    ...row,
    problem_solution_fit: typeof row.problem_solution_fit === 'string' ? JSON.parse(row.problem_solution_fit) : row.problem_solution_fit,
    swot_analysis: typeof row.swot_analysis === 'string' ? JSON.parse(row.swot_analysis) : row.swot_analysis,
    target_audience: typeof row.target_audience === 'string' ? JSON.parse(row.target_audience) : row.target_audience,
    dimension_scores: typeof row.dimension_scores === 'string' ? JSON.parse(row.dimension_scores) : row.dimension_scores,
    full_report: typeof row.full_report === 'string' ? JSON.parse(row.full_report) : row.full_report,
    recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations,
  };
};

export const getValidationHistoryByStartup = async (startupId) => {
  const pool = getPool();
  const sql = `
    SELECT id, startup_id, overall_score, verdict, created_at
    FROM idea_validations
    WHERE startup_id = ?
    ORDER BY created_at DESC, id DESC
  `;
  const [rows] = await pool.execute(sql, [startupId]);
  return rows;
};

export const getValidationByIdAndStartup = async (validationId, startupId) => {
  const pool = getPool();
  const sql = `
    SELECT *
    FROM idea_validations
    WHERE id = ? AND startup_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [validationId, startupId]);
  if (!rows[0]) return null;

  const row = rows[0];
  return {
    ...row,
    problem_solution_fit: typeof row.problem_solution_fit === 'string' ? JSON.parse(row.problem_solution_fit) : row.problem_solution_fit,
    swot_analysis: typeof row.swot_analysis === 'string' ? JSON.parse(row.swot_analysis) : row.swot_analysis,
    target_audience: typeof row.target_audience === 'string' ? JSON.parse(row.target_audience) : row.target_audience,
    dimension_scores: typeof row.dimension_scores === 'string' ? JSON.parse(row.dimension_scores) : row.dimension_scores,
    full_report: typeof row.full_report === 'string' ? JSON.parse(row.full_report) : row.full_report,
    recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations,
  };
};
