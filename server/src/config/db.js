import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { ENV } from './env.js';
import { runSettingsMigration } from '../migrations/migrateSettings.js';

const { Pool: PgPool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let poolInstance = null;

/**
 * Transforms MySQL-style query (with `?` and backticks) to Postgres-style ($1, $2)
 */
function preparePostgresQuery(sql, params = []) {
  // 1. Remove backticks
  let cleanedSql = sql.replace(/`/g, '').trim();

  // 2. Normalize ON DUPLICATE KEY UPDATE to ON CONFLICT DO UPDATE
  if (/ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(cleanedSql)) {
    // If readiness_scores
    if (/readiness_scores/i.test(cleanedSql)) {
      cleanedSql = cleanedSql.replace(
        /ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*$/i,
        `ON CONFLICT (startup_id) DO UPDATE SET
          overall_score = EXCLUDED.overall_score,
          validation_score = EXCLUDED.validation_score,
          market_score = EXCLUDED.market_score,
          financial_score = EXCLUDED.financial_score,
          investor_score = EXCLUDED.investor_score,
          pitch_score = EXCLUDED.pitch_score,
          breakdown = EXCLUDED.breakdown,
          action_checklist = COALESCE(EXCLUDED.action_checklist, readiness_scores.action_checklist),
          updated_at = CURRENT_TIMESTAMP`
      );
    } else if (/user_preferences/i.test(cleanedSql)) {
      cleanedSql = cleanedSql.replace(
        /ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*$/i,
        `ON CONFLICT (user_id) DO UPDATE SET
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
          updated_at = CURRENT_TIMESTAMP`
      );
    }
  }

  // 3. For INSERT without RETURNING, append RETURNING *
  const isInsert = /^\s*INSERT\s+INTO/i.test(cleanedSql);
  if (isInsert && !/RETURNING/i.test(cleanedSql)) {
    cleanedSql += ' RETURNING *';
  }

  // 4. Transform ? placeholders to $1, $2, ...
  let pIdx = 1;
  const pgSql = cleanedSql.replace(/\?/g, () => `$${pIdx++}`);

  // 5. Sanitize params: undefined -> null, boolean -> 1 / 0 (if matching smallint)
  const sanitizedParams = (Array.isArray(params) ? params : []).map((val) => {
    if (val === undefined) return null;
    if (typeof val === 'boolean') return val ? 1 : 0;
    return val;
  });

  return { sql: pgSql, params: sanitizedParams, isInsert };
}

/**
 * Creates a compatibility wrapper around PostgreSQL Pool that mimics mysql2/promise
 */
function createPostgresAdapter(pgPool) {
  const executeQuery = async (queryText, params = []) => {
    const { sql, params: preparedParams } = preparePostgresQuery(queryText, params);
    const res = await pgPool.query(sql, preparedParams);

    const isSelect = /^\s*(SELECT|WITH|SHOW)/i.test(sql);

    if (isSelect) {
      return [res.rows, res.fields];
    }

    // For INSERT, UPDATE, DELETE
    const insertId = res.rows?.[0]?.id ?? null;
    const resultObj = {
      insertId,
      affectedRows: res.rowCount,
      rowCount: res.rowCount,
      rows: res.rows,
      ...(res.rows?.[0] || {}),
    };

    return [resultObj, res.fields];
  };

  return {
    isPostgres: true,
    rawPool: pgPool,
    query: executeQuery,
    execute: executeQuery,
    end: () => pgPool.end(),
  };
}

export const getPool = () => {
  if (poolInstance) return poolInstance;

  if (ENV.DATABASE_URL) {
    const pgPool = new PgPool({
      connectionString: ENV.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    poolInstance = createPostgresAdapter(pgPool);
    return poolInstance;
  }

  // Fallback to MySQL
  poolInstance = mysql.createPool({
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

  return poolInstance;
};

// Initialize DB schema automatically
export const initializeDatabase = async () => {
  if (ENV.DATABASE_URL) {
    try {
      const pool = getPool();
      const schemaPath = path.resolve(__dirname, '../../schema.postgres.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.rawPool.query(schemaSql);
        console.log('✅ Connected to Neon PostgreSQL database.');
        console.log('✅ PostgreSQL database schema verified / initialized successfully.');
        await runSettingsMigration();
      } else {
        console.warn('⚠️ schema.postgres.sql not found at:', schemaPath);
      }
    } catch (err) {
      console.error('⚠️ Neon PostgreSQL Connection / Initialization Notice:', err.message);
    }
    return;
  }

  // Fallback to MySQL bootstrap
  let bootstrapConnection;
  try {
    bootstrapConnection = await mysql.createConnection({
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server.');

    const schemaPath = path.resolve(__dirname, '../../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await bootstrapConnection.query(schemaSql);
      console.log('✅ Database schema verified / initialized successfully.');
      await runSettingsMigration();
    } else {
      console.warn('⚠️ schema.sql not found at:', schemaPath);
    }
  } catch (err) {
    console.error('⚠️ MySQL Connection / Initialization Notice:', err.message);
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
