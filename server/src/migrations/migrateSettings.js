import { getPool } from '../config/db.js';

export const runSettingsMigration = async () => {
  const pool = getPool();
  try {
    if (pool.isPostgres) {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS headline VARCHAR(150) DEFAULT NULL');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT NULL');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(120) DEFAULT NULL');
      console.log('✅ Settings migration verified for PostgreSQL.');
      return;
    }

    // 1. Modify avatar_url to MEDIUMTEXT to allow base64 or long image URLs
    await pool.query('ALTER TABLE `users` MODIFY COLUMN `avatar_url` MEDIUMTEXT NULL');

    // 2. Add profile columns if not present
    const [cols] = await pool.query('DESCRIBE users');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('bio')) {
      await pool.query('ALTER TABLE `users` ADD COLUMN `bio` TEXT NULL AFTER `avatar_url`');
    }
    if (!colNames.includes('headline')) {
      await pool.query('ALTER TABLE `users` ADD COLUMN `headline` VARCHAR(150) NULL AFTER `bio`');
    }
    if (!colNames.includes('phone')) {
      await pool.query('ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(50) NULL AFTER `headline`');
    }
    if (!colNames.includes('location')) {
      await pool.query('ALTER TABLE `users` ADD COLUMN `location` VARCHAR(120) NULL AFTER `phone`');
    }

    // 3. Create user_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL UNIQUE,
        email_notifications TINYINT(1) NOT NULL DEFAULT 1,
        analysis_completed TINYINT(1) NOT NULL DEFAULT 1,
        investor_activity TINYINT(1) NOT NULL DEFAULT 1,
        pitch_evaluated TINYINT(1) NOT NULL DEFAULT 1,
        monthly_summary TINYINT(1) NOT NULL DEFAULT 1,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        currency_symbol VARCHAR(5) NOT NULL DEFAULT '₹',
        number_format VARCHAR(20) NOT NULL DEFAULT 'indian',
        date_format VARCHAR(30) NOT NULL DEFAULT 'DD/MM/YYYY',
        theme VARCHAR(20) NOT NULL DEFAULT 'dark',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Settings migration applied successfully.');
  } catch (err) {
    console.error('Migration error:', err.message);
    throw err;
  }
};

if (process.argv[1]?.endsWith('migrateSettings.js')) {
  runSettingsMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}
