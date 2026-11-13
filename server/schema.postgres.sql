-- VentureMind AI Database Schema for PostgreSQL / Neon
-- Production-ready PostgreSQL DDL with proper indexes, constraints, and cascading

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  headline VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  location VARCHAR(120) DEFAULT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'founder',
  email_verified SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 1b. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications SMALLINT NOT NULL DEFAULT 1,
  analysis_completed SMALLINT NOT NULL DEFAULT 1,
  investor_activity SMALLINT NOT NULL DEFAULT 1,
  pitch_evaluated SMALLINT NOT NULL DEFAULT 1,
  monthly_summary SMALLINT NOT NULL DEFAULT 1,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  currency_symbol VARCHAR(5) NOT NULL DEFAULT '₹',
  number_format VARCHAR(20) NOT NULL DEFAULT 'indian',
  date_format VARCHAR(30) NOT NULL DEFAULT 'DD/MM/YYYY',
  theme VARCHAR(20) NOT NULL DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1c. Email Verifications Table
CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts SMALLINT NOT NULL DEFAULT 0,
  used SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_verification_user ON email_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON email_verifications (expires_at);

-- 2. Startups / Ventures Table
CREATE TABLE IF NOT EXISTS startups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  tagline VARCHAR(255) DEFAULT NULL,
  industry VARCHAR(100) NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'Idea',
  target_customer VARCHAR(255) NOT NULL,
  problem_statement TEXT NOT NULL,
  solution_statement TEXT NOT NULL,
  revenue_model VARCHAR(120) DEFAULT 'SaaS Subscription',
  pitch_summary TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_startups_user ON startups (user_id);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON startups (industry);

-- 3. AI Idea Validations
CREATE TABLE IF NOT EXISTS idea_validations (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  problem_solution_fit TEXT NOT NULL,
  swot_analysis TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  viability_score SMALLINT NOT NULL DEFAULT 0,
  overall_score SMALLINT NOT NULL DEFAULT 0,
  verdict VARCHAR(60) DEFAULT NULL,
  dimension_scores TEXT DEFAULT NULL,
  full_report TEXT DEFAULT NULL,
  recommendations TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_validations_startup ON idea_validations (startup_id);

-- 4. Market Research & Competitor Analysis
CREATE TABLE IF NOT EXISTS market_research (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  tam_usd BIGINT DEFAULT 0,
  sam_usd BIGINT DEFAULT 0,
  som_usd BIGINT DEFAULT 0,
  tam_explanation TEXT NULL,
  sam_explanation TEXT NULL,
  som_explanation TEXT NULL,
  customer_segments TEXT DEFAULT NULL,
  growth_drivers TEXT DEFAULT NULL,
  barriers_to_entry TEXT DEFAULT NULL,
  market_trends TEXT DEFAULT NULL,
  market_opportunities TEXT DEFAULT NULL,
  full_report TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_market_startup ON market_research (startup_id);

-- 5. Competitor Matrix
CREATE TABLE IF NOT EXISTS competitors (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  competitor_name VARCHAR(150) NOT NULL,
  market_tier VARCHAR(50) NOT NULL DEFAULT 'Direct',
  target_audience VARCHAR(255) NULL,
  pricing_info VARCHAR(255) NULL,
  key_features TEXT NULL,
  strengths TEXT DEFAULT NULL,
  weaknesses TEXT DEFAULT NULL,
  differentiator TEXT DEFAULT NULL,
  possible_gaps TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_competitors_startup ON competitors (startup_id);

-- 6. Financial Simulation Models
CREATE TABLE IF NOT EXISTS financial_models (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  model_name VARCHAR(150) NOT NULL DEFAULT 'Base Scenario',
  pricing_model VARCHAR(60) NOT NULL DEFAULT 'SaaS',
  default_price DECIMAL(12, 2) NOT NULL DEFAULT 49.00,
  cac DECIMAL(12, 2) NOT NULL DEFAULT 120.00,
  ltv DECIMAL(12, 2) NOT NULL DEFAULT 650.00,
  monthly_churn_rate DECIMAL(5, 2) NOT NULL DEFAULT 4.50,
  monthly_burn_rate DECIMAL(12, 2) NOT NULL DEFAULT 5000.00,
  inputs TEXT NULL,
  results TEXT NULL,
  scenarios TEXT NULL,
  projections_data TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_finance_startup ON financial_models (startup_id);

-- 7. Multi-Persona Investor Chat Sessions
CREATE TABLE IF NOT EXISTS investor_sessions (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  persona_id VARCHAR(50) NOT NULL,
  persona_name VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  verdict VARCHAR(30) NOT NULL DEFAULT 'undecided',
  evaluation_score SMALLINT NULL DEFAULT NULL,
  evaluation_report TEXT NULL,
  feedback_summary TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_startup ON investor_sessions (startup_id);
CREATE INDEX IF NOT EXISTS idx_sessions_persona ON investor_sessions (persona_id);

-- 8. Investor Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES investor_sessions(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  tone_or_sentiment VARCHAR(60) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages (session_id);

-- 9. AI Pitch Evaluations
CREATE TABLE IF NOT EXISTS pitch_evaluations (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  pitch_transcript TEXT NOT NULL,
  problem_clarity_score SMALLINT NOT NULL DEFAULT 0,
  market_opportunity_score SMALLINT NOT NULL DEFAULT 0,
  business_model_score SMALLINT NOT NULL DEFAULT 0,
  defensibility_score SMALLINT NOT NULL DEFAULT 0,
  presentation_score SMALLINT NOT NULL DEFAULT 0,
  overall_score SMALLINT NOT NULL DEFAULT 0,
  category_scores TEXT NULL,
  pitch_strengths TEXT NULL,
  pitch_weaknesses TEXT NULL,
  missing_information TEXT NULL,
  improved_pitch TEXT NULL,
  full_report TEXT NULL,
  actionable_feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pitch_startup ON pitch_evaluations (startup_id);

-- 10. Startup Readiness Scores
CREATE TABLE IF NOT EXISTS readiness_scores (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER NOT NULL UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  overall_score SMALLINT NOT NULL DEFAULT 0,
  validation_score SMALLINT NOT NULL DEFAULT 0,
  market_score SMALLINT NOT NULL DEFAULT 0,
  financial_score SMALLINT NOT NULL DEFAULT 0,
  investor_score SMALLINT NOT NULL DEFAULT 0,
  pitch_score SMALLINT NOT NULL DEFAULT 0,
  breakdown TEXT NULL,
  action_checklist TEXT DEFAULT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

