import { ENV } from './src/config/env.js';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  database: ENV.DB.NAME,
  multipleStatements: true,
});

try {
  await conn.query('ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER role');
  console.log('ADDED email_verified column');
} catch (e) {
  console.log('Column status:', e.code || e.message);
}

try {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
      used TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_verification_user (user_id),
      INDEX idx_verification_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('email_verifications table ready');
} catch (e) {
  console.log('Table status:', e.code || e.message);
}

await conn.end();
process.exit(0);
