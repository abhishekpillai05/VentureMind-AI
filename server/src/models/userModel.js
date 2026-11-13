import { getPool } from '../config/db.js';

export const createUser = async ({ full_name, email, password_hash, role = 'founder' }) => {
  const pool = getPool();
  const sql = `
    INSERT INTO users (full_name, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, ?, 0)
  `;
  const [result] = await pool.execute(sql, [full_name, email, password_hash, role]);
  return {
    id: result.insertId,
    full_name,
    email,
    role,
    email_verified: false,
  };
};

export const findUserByEmail = async (email) => {
  const pool = getPool();
  const sql = `
    SELECT id, full_name, email, password_hash, role, avatar_url, bio, headline, phone, location, email_verified, created_at, updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const pool = getPool();
  const sql = `
    SELECT id, full_name, email, role, avatar_url, bio, headline, phone, location, email_verified, created_at, updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0] || null;
};

export const findUserWithPasswordById = async (id) => {
  const pool = getPool();
  const sql = `
    SELECT id, full_name, email, password_hash, role, avatar_url, bio, headline, phone, location, email_verified, created_at, updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0] || null;
};

export const updateUserProfile = async (
  id,
  { full_name, bio = null, headline = null, phone = null, location = null, avatar_url = null }
) => {
  const pool = getPool();
  const sql = `
    UPDATE users
    SET full_name = ?,
        bio = ?,
        headline = ?,
        phone = ?,
        location = ?,
        avatar_url = ?
    WHERE id = ?
  `;
  await pool.execute(sql, [full_name, bio, headline, phone, location, avatar_url, id]);
  return findUserById(id);
};

export const updateUserPassword = async (id, password_hash) => {
  const pool = getPool();
  const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
  await pool.execute(sql, [password_hash, id]);
};

export const getUserPreferences = async (userId) => {
  const pool = getPool();
  const sql = `
    SELECT id, user_id, email_notifications, analysis_completed, investor_activity,
           pitch_evaluated, monthly_summary, currency, currency_symbol, number_format,
           date_format, theme, updated_at
    FROM user_preferences
    WHERE user_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [userId]);
  if (rows[0]) {
    return {
      email_notifications: Boolean(rows[0].email_notifications),
      analysis_completed: Boolean(rows[0].analysis_completed),
      investor_activity: Boolean(rows[0].investor_activity),
      pitch_evaluated: Boolean(rows[0].pitch_evaluated),
      monthly_summary: Boolean(rows[0].monthly_summary),
      currency: rows[0].currency || 'INR',
      currency_symbol: rows[0].currency_symbol || '₹',
      number_format: rows[0].number_format || 'indian',
      date_format: rows[0].date_format || 'DD/MM/YYYY',
      theme: rows[0].theme || 'dark',
      updated_at: rows[0].updated_at,
    };
  }
  return {
    email_notifications: true,
    analysis_completed: true,
    investor_activity: true,
    pitch_evaluated: true,
    monthly_summary: true,
    currency: 'INR',
    currency_symbol: '₹',
    number_format: 'indian',
    date_format: 'DD/MM/YYYY',
    theme: 'dark',
  };
};

export const upsertUserPreferences = async (userId, prefs) => {
  const pool = getPool();
  const sql = `
    INSERT INTO user_preferences (
      user_id, email_notifications, analysis_completed, investor_activity,
      pitch_evaluated, monthly_summary, currency, currency_symbol, number_format,
      date_format, theme
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id) DO UPDATE SET
      email_notifications = EXCLUDED.email_notifications,
      analysis_completed = EXCLUDED.analysis_completed,
      investor_activity = EXCLUDED.investor_activity,
      pitch_evaluated = EXCLUDED.pitch_evaluated,
      monthly_summary = EXCLUDED.monthly_summary,
      currency = EXCLUDED.currency,
      currency_symbol = EXCLUDED.currency_symbol,
      number_format = EXCLUDED.number_format,
      date_format = EXCLUDED.date_format,
      theme = EXCLUDED.theme,
      updated_at = CURRENT_TIMESTAMP
  `;
  await pool.execute(sql, [
    userId,
    prefs.email_notifications ? 1 : 0,
    prefs.analysis_completed ? 1 : 0,
    prefs.investor_activity ? 1 : 0,
    prefs.pitch_evaluated ? 1 : 0,
    prefs.monthly_summary ? 1 : 0,
    prefs.currency || 'INR',
    prefs.currency_symbol || '₹',
    prefs.number_format || 'indian',
    prefs.date_format || 'DD/MM/YYYY',
    prefs.theme || 'dark',
  ]);
  return getUserPreferences(userId);
};

export const deleteUserById = async (userId) => {
  const pool = getPool();
  const sql = `DELETE FROM users WHERE id = ?`;
  const [result] = await pool.execute(sql, [userId]);
  return result.affectedRows > 0;
};

export const markEmailVerified = async (userId) => {
  const pool = getPool();
  const sql = `UPDATE users SET email_verified = 1 WHERE id = ?`;
  await pool.execute(sql, [userId]);
};
