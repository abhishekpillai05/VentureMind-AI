import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { initializeDatabase } from './config/db.js';
import { verifySMTPConnection } from './services/emailService.js';
import authRoutes from './routes/authRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import validatorRoutes from './routes/validatorRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import financialRoutes from './routes/financialRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import pitchRoutes from './routes/pitchRoutes.js';
import readinessRoutes from './routes/readinessRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VentureMind AI API',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/validator', validatorRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/finance', financialRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/pitch', pitchRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/currency', currencyRoutes);

// 404 Route Catch-all
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server when invoked directly
const PORT = Number(process.env.TEST_PORT) || ENV.PORT;
let server = null;

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMainModule || !process.env.TEST_MODE) {
  server = app.listen(PORT, async () => {
    console.log(`🚀 VentureMind AI Backend running on http://localhost:${PORT}`);
    // Run schema initialization / verification check
    await initializeDatabase();
    // Verify SMTP Connection
    await verifySMTPConnection();
  });
}

export { app, server };
export default app;
