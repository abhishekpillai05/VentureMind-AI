import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from the server folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: (process.env.DATABASE_URL || '').trim(),
  DB: {
    HOST: (process.env.DB_HOST || 'localhost').trim(),
    PORT: Number(process.env.DB_PORT) || 3306,
    USER: (process.env.DB_USER || 'root').trim(),
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: (process.env.DB_NAME || 'venturemind_db').trim(),
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'venturemind_default_fallback_secret_key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  SMTP: {
    HOST: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
    PORT: Number(process.env.SMTP_PORT) || 587,
    USER: (process.env.SMTP_USER || '').trim(),
    // Remove any accidental spaces in app password (e.g. 'abcd efgh ijkl mnop')
    PASS: (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim(),
    FROM_NAME: (process.env.SMTP_FROM_NAME || 'VentureMind AI').trim(),
    FROM_EMAIL: (process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '').trim(),
  },
  GEMINI: {
    API_KEY: (process.env.GEMINI_API_KEY || '').trim(),
  },
};
