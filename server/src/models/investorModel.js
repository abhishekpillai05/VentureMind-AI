import { getPool } from '../config/db.js';

export const createInvestorSession = async ({ startup_id, persona_id, persona_name }) => {
  const pool = getPool();
  const [res] = await pool.execute(
    `INSERT INTO investor_sessions (startup_id, persona_id, persona_name, status, verdict)
     VALUES (?, ?, ?, 'active', 'undecided')`,
    [startup_id, persona_id, persona_name]
  );
  return { id: res.insertId, startup_id, persona_id, persona_name, status: 'active', verdict: 'undecided' };
};

export const getInvestorSessionById = async (session_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM investor_sessions WHERE id = ?`,
    [session_id]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    evaluation_report: typeof r.evaluation_report === 'string' ? JSON.parse(r.evaluation_report) : r.evaluation_report,
  };
};

export const getInvestorSessionsByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM investor_sessions WHERE startup_id = ? ORDER BY id DESC`,
    [startup_id]
  );
  return rows.map((r) => ({
    ...r,
    evaluation_report: typeof r.evaluation_report === 'string' ? JSON.parse(r.evaluation_report) : r.evaluation_report,
  }));
};

export const saveChatMessage = async ({ session_id, sender, message, tone_or_sentiment = null }) => {
  const pool = getPool();
  const [res] = await pool.execute(
    `INSERT INTO chat_messages (session_id, sender, message, tone_or_sentiment)
     VALUES (?, ?, ?, ?)`,
    [session_id, sender, message, tone_or_sentiment]
  );
  return { id: res.insertId, session_id, sender, message, tone_or_sentiment, created_at: new Date() };
};

export const getChatMessagesBySession = async (session_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY id ASC`,
    [session_id]
  );
  return rows;
};

export const completeInvestorSession = async ({
  session_id,
  verdict = 'term_sheet',
  evaluation_score = 75,
  evaluation_report = null,
  feedback_summary = null,
}) => {
  const pool = getPool();
  await pool.execute(
    `UPDATE investor_sessions 
     SET status = 'completed', verdict = ?, evaluation_score = ?, evaluation_report = ?, feedback_summary = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      verdict,
      evaluation_score,
      evaluation_report ? JSON.stringify(evaluation_report) : null,
      feedback_summary,
      session_id,
    ]
  );
};
