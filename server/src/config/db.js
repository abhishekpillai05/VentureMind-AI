import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './env.js';
import { runSettingsMigration } from '../migrations/migrateSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      database: ENV.DB.NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
};

// Initialize DB schema automatically
export const initializeDatabase = async () => {
  let bootstrapConnection;
  try {
    // 1. First connect without specifying database to ensure venturemind_db exists
    bootstrapConnection = await mysql.createConnection({
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server.');

    // 2. Read schema.sql
    const schemaPath = path.resolve(__dirname, '../../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await bootstrapConnection.query(schemaSql);
      console.log('✅ Database schema verified / initialized successfully.');
      // Ensure settings columns and preferences table are migrated
      await runSettingsMigration();
    } else {
      console.warn('⚠️ schema.sql not found at:', schemaPath);
    }
  } catch (err) {
    console.error('⚠️ MySQL Connection / Initialization Notice:', err.message);
    console.warn(
      '👉 Tip: If your MySQL password is set or service is not running yet, update DB_PASSWORD in server/.env when ready.'
    );
  } finally {
    if (bootstrapConnection) {
      await bootstrapConnection.end().catch(() => {});
    }
  }
};

export default {
  getPool,
  initializeDatabase,
};
