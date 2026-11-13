import { getPool } from '../config/db.js';

export const createStartup = async ({
  user_id,
  name,
  tagline = null,
  industry,
  stage = 'Idea',
  target_customer,
  problem_statement,
  solution_statement,
  revenue_model = 'SaaS Subscription',
  pitch_summary = null,
}) => {
  const pool = getPool();
  const sql = `
    INSERT INTO startups 
      (user_id, name, tagline, industry, stage, target_customer, problem_statement, solution_statement, revenue_model, pitch_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    user_id,
    name,
    tagline,
    industry,
    stage,
    target_customer,
    problem_statement,
    solution_statement,
    revenue_model,
    pitch_summary,
  ]);
  return {
    id: result.insertId,
    user_id,
    name,
    tagline,
    industry,
    stage,
    target_customer,
    problem_statement,
    solution_statement,
    revenue_model,
    pitch_summary,
  };
};

export const getStartupsByUserId = async (userId) => {
  const pool = getPool();
  const sql = `
    SELECT s.*, 
           rs.overall_score as readiness_score,
           iv.overall_score as latest_validation_score,
           iv.verdict as latest_validation_verdict
    FROM startups s
    LEFT JOIN readiness_scores rs ON s.id = rs.startup_id
    LEFT JOIN (
      SELECT startup_id, overall_score, verdict
      FROM idea_validations
      WHERE id IN (
        SELECT MAX(id) FROM idea_validations GROUP BY startup_id
      )
    ) iv ON s.id = iv.startup_id
    WHERE s.user_id = ?
    ORDER BY s.updated_at DESC
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows;
};

// Strict ownership verification: returns startup only if owned by userId
export const getStartupByIdAndUser = async (startupId, userId) => {
  const pool = getPool();
  const sql = `
    SELECT s.*, 
           rs.overall_score as readiness_score,
           iv.overall_score as latest_validation_score,
           iv.verdict as latest_validation_verdict,
           iv.id as latest_validation_id
    FROM startups s
    LEFT JOIN readiness_scores rs ON s.id = rs.startup_id
    LEFT JOIN (
      SELECT id, startup_id, overall_score, verdict
      FROM idea_validations
      WHERE id IN (
        SELECT MAX(id) FROM idea_validations GROUP BY startup_id
      )
    ) iv ON s.id = iv.startup_id
    WHERE s.id = ? AND s.user_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [startupId, userId]);
  return rows[0] || null;
};

export const updateStartupByIdAndUser = async (
  startupId,
  userId,
  {
    name,
    tagline = null,
    industry,
    stage = 'Idea',
    target_customer,
    problem_statement,
    solution_statement,
    revenue_model = 'SaaS Subscription',
    pitch_summary = null,
  }
) => {
  const pool = getPool();
  const sql = `
    UPDATE startups
    SET name = ?,
        tagline = ?,
        industry = ?,
        stage = ?,
        target_customer = ?,
        problem_statement = ?,
        solution_statement = ?,
        revenue_model = ?,
        pitch_summary = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `;
  const [result] = await pool.execute(sql, [
    name,
    tagline,
    industry,
    stage,
    target_customer,
    problem_statement,
    solution_statement,
    revenue_model,
    pitch_summary,
    startupId,
    userId,
  ]);

  if (result.affectedRows === 0) {
    return null;
  }

  return getStartupByIdAndUser(startupId, userId);
};

export const deleteStartupByIdAndUser = async (startupId, userId) => {
  const pool = getPool();
  const sql = `
    DELETE FROM startups 
    WHERE id = ? AND user_id = ?
  `;
  const [result] = await pool.execute(sql, [startupId, userId]);
  return result.affectedRows > 0;
};
