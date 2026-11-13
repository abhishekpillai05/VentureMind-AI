-- VentureMind AI Database Schema
-- Production-ready MySQL DDL with proper indexes, constraints, and cascading

CREATE DATABASE IF NOT EXISTS `venturemind_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `venturemind_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar_url` MEDIUMTEXT DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `headline` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `location` VARCHAR(120) DEFAULT NULL,
  `role` ENUM('founder', 'incubator', 'admin') NOT NULL DEFAULT 'founder',
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1b. User Preferences Table
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `email_notifications` TINYINT(1) NOT NULL DEFAULT 1,
  `analysis_completed` TINYINT(1) NOT NULL DEFAULT 1,
  `investor_activity` TINYINT(1) NOT NULL DEFAULT 1,
  `pitch_evaluated` TINYINT(1) NOT NULL DEFAULT 1,
  `monthly_summary` TINYINT(1) NOT NULL DEFAULT 1,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `currency_symbol` VARCHAR(5) NOT NULL DEFAULT '₹',
  `number_format` VARCHAR(20) NOT NULL DEFAULT 'indian',
  `date_format` VARCHAR(30) NOT NULL DEFAULT 'DD/MM/YYYY',
  `theme` VARCHAR(20) NOT NULL DEFAULT 'dark',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1b. Email Verifications Table
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_verification_user` (`user_id`),
  INDEX `idx_verification_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Startups / Ventures Table
CREATE TABLE IF NOT EXISTS `startups` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `tagline` VARCHAR(255) DEFAULT NULL,
  `industry` VARCHAR(100) NOT NULL,
  `stage` ENUM('Idea', 'Validation', 'Prototype/MVP', 'Early Traction', 'Scaling') NOT NULL DEFAULT 'Idea',
  `target_customer` VARCHAR(255) NOT NULL,
  `problem_statement` TEXT NOT NULL,
  `solution_statement` TEXT NOT NULL,
  `revenue_model` VARCHAR(120) DEFAULT 'SaaS Subscription',
  `pitch_summary` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_startups_user` (`user_id`),
  INDEX `idx_startups_industry` (`industry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AI Idea Validations
CREATE TABLE IF NOT EXISTS `idea_validations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `problem_solution_fit` JSON NOT NULL,
  `swot_analysis` JSON NOT NULL,
  `target_audience` JSON NOT NULL,
  `viability_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `overall_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `verdict` VARCHAR(60) DEFAULT NULL,
  `dimension_scores` JSON DEFAULT NULL,
  `full_report` JSON DEFAULT NULL,
  `recommendations` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE,
  INDEX `idx_validations_startup` (`startup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Market Research & Competitor Analysis
CREATE TABLE IF NOT EXISTS `market_research` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `tam_usd` BIGINT UNSIGNED DEFAULT 0,
  `sam_usd` BIGINT UNSIGNED DEFAULT 0,
  `som_usd` BIGINT UNSIGNED DEFAULT 0,
  `tam_explanation` TEXT NULL,
  `sam_explanation` TEXT NULL,
  `som_explanation` TEXT NULL,
  `customer_segments` JSON DEFAULT NULL,
  `growth_drivers` JSON DEFAULT NULL,
  `barriers_to_entry` JSON DEFAULT NULL,
  `market_trends` JSON DEFAULT NULL,
  `market_opportunities` JSON DEFAULT NULL,
  `full_report` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE,
  INDEX `idx_market_startup` (`startup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Competitor Matrix
CREATE TABLE IF NOT EXISTS `competitors` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `competitor_name` VARCHAR(150) NOT NULL,
  `market_tier` ENUM('Direct', 'Indirect', 'Potential') NOT NULL DEFAULT 'Direct',
  `target_audience` VARCHAR(255) NULL,
  `pricing_info` VARCHAR(255) NULL,
  `key_features` JSON NULL,
  `strengths` TEXT DEFAULT NULL,
  `weaknesses` TEXT DEFAULT NULL,
  `differentiator` TEXT DEFAULT NULL,
  `possible_gaps` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE,
  INDEX `idx_competitors_startup` (`startup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Financial Simulation Models
CREATE TABLE IF NOT EXISTS `financial_models` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `model_name` VARCHAR(150) NOT NULL DEFAULT 'Base Scenario',
  `pricing_model` VARCHAR(60) NOT NULL DEFAULT 'SaaS',
  `default_price` DECIMAL(12, 2) NOT NULL DEFAULT 49.00,
  `cac` DECIMAL(12, 2) NOT NULL DEFAULT 120.00,
  `ltv` DECIMAL(12, 2) NOT NULL DEFAULT 650.00,
  `monthly_churn_rate` DECIMAL(5, 2) NOT NULL DEFAULT 4.50,
  `monthly_burn_rate` DECIMAL(12, 2) NOT NULL DEFAULT 5000.00,
  `inputs` JSON NULL,
  `results` JSON NULL,
  `scenarios` JSON NULL,
  `projections_data` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE,
  INDEX `idx_finance_startup` (`startup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Multi-Persona Investor Chat Sessions
CREATE TABLE IF NOT EXISTS `investor_sessions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `persona_id` VARCHAR(50) NOT NULL,
  `persona_name` VARCHAR(100) NOT NULL,
  `status` ENUM('active', 'completed', 'abandoned') NOT NULL DEFAULT 'active',
  `verdict` ENUM('undecided', 'passed', 'follow_up', 'term_sheet') NOT NULL DEFAULT 'undecided',
  `evaluation_score` TINYINT UNSIGNED NULL DEFAULT NULL,
  `evaluation_report` JSON NULL,
  `feedback_summary` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE,
  INDEX `idx_sessions_startup` (`startup_id`),
  INDEX `idx_sessions_persona` (`persona_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Investor Chat Messages
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id` INT UNSIGNED NOT NULL,
  `sender` ENUM('user', 'investor') NOT NULL,
  `message` TEXT NOT NULL,
  `tone_or_sentiment` VARCHAR(60) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`session_id`) REFERENCES `investor_sessions`(`id`) ON DELETE CASCADE,
  INDEX `idx_messages_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AI Pitch Evaluations
CREATE TABLE IF NOT EXISTS `pitch_evaluations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `pitch_transcript` TEXT NOT NULL,
  `problem_clarity_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `market_opportunity_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `business_model_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `defensibility_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `presentation_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `overall_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `category_scores` JSON NULL,
  `pitch_strengths` JSON NULL,
  `pitch_weaknesses` JSON NULL,
  `missing_information` JSON NULL,
  `improved_pitch` TEXT NULL,
  `full_report` JSON NULL,
  `actionable_feedback` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE,
  INDEX `idx_pitch_startup` (`startup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Startup Readiness Scores
CREATE TABLE IF NOT EXISTS `readiness_scores` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `overall_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `validation_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `market_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `financial_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `investor_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `pitch_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `breakdown` JSON NULL,
  `action_checklist` JSON DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_readiness_startup` (`startup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
