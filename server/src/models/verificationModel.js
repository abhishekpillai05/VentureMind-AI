import { getPool } from '../config/db.js';

export const createVerification = async ({ user_id, otp_hash, expires_at }) => {
  const pool = getPool();
  // Invalidate all previous OTPs for this user
  await pool.execute(
    `UPDATE email_verifications SET used = 1 WHERE user_id = ? AND used = 0`,
    [user_id]
  );
  const sql = `
    INSERT INTO email_verifications (user_id, otp_hash, expires_at, attempts, used)
    VALUES (?, ?, ?, 0, 0)
  `;
  const [result] = await pool.execute(sql, [user_id, otp_hash, expires_at]);
  return { id: result.insertId };
};

export const getActiveVerification = async (userId) => {
  const pool = getPool();
  const sql = `
    SELECT id, user_id, otp_hash, expires_at, attempts, used, created_at
    FROM email_verifications
    WHERE user_id = ? AND used = 0
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows[0] || null;
};

export const incrementAttempts = async (verificationId) => {
  const pool = getPool();
  await pool.execute(
    `UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?`,
    [verificationId]
  );
};

export const markVerificationUsed = async (verificationId) => {
  const pool = getPool();
  await pool.execute(
    `UPDATE email_verifications SET used = 1 WHERE id = ?`,
    [verificationId]
  );
};
