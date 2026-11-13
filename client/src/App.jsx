import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { StartupListPage } from './pages/startups/StartupListPage';
import { StartupDetailsPage } from './pages/startups/StartupDetailsPage';
import { IdeaValidatorPage } from './pages/validator/IdeaValidatorPage';
import { MarketResearchPage } from './pages/market/MarketResearchPage';
import { FinancialSimulatorPage } from './pages/finance/FinancialSimulatorPage';
import { InvestorSimulationPage } from './pages/investors/InvestorSimulationPage';
import { PitchEvaluationPage } from './pages/pitch/PitchEvaluationPage';
import { StartupReadinessPage } from './pages/readiness/StartupReadinessPage';
import { ReportGenerationPage } from './pages/reports/ReportGenerationPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ModulePlaceholder } from './pages/ModulePlaceholder';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Authenticated Dashboard Workspace */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            {/* Startup Management (Phase 2) */}
            <Route path="startups" element={<StartupListPage />} />
            <Route path="startups/:id" element={<StartupDetailsPage />} />

            {/* AI Idea Validator (Phase 2) */}
            <Route path="validator" element={<IdeaValidatorPage />} />
            <Route path="validator/:startupId" element={<IdeaValidatorPage />} />
            {/* Market Research (Module 1) */}
            <Route path="market" element={<MarketResearchPage />} />
            <Route path="market/:startupId" element={<MarketResearchPage />} />
            <Route path="market-research" element={<MarketResearchPage />} />
            <Route path="market-research/:startupId" element={<MarketResearchPage />} />

            {/* Financial Simulator (Module 2) */}
            <Route path="finance" element={<FinancialSimulatorPage />} />
            <Route path="finance/:startupId" element={<FinancialSimulatorPage />} />
            <Route path="financial-simulator" element={<FinancialSimulatorPage />} />
            <Route path="financial-simulator/:startupId" element={<FinancialSimulatorPage />} />

            {/* AI Investor Simulation (Module 3) */}
            <Route path="investors" element={<InvestorSimulationPage />} />
            <Route path="investors/:startupId" element={<InvestorSimulationPage />} />
            <Route path="investor" element={<InvestorSimulationPage />} />
            <Route path="investor/:startupId" element={<InvestorSimulationPage />} />

            {/* AI Pitch Evaluation (Module 4) */}
            <Route path="pitch" element={<PitchEvaluationPage />} />
            <Route path="pitch/:startupId" element={<PitchEvaluationPage />} />
            <Route path="pitch-evaluation" element={<PitchEvaluationPage />} />
            <Route path="pitch-evaluation/:startupId" element={<PitchEvaluationPage />} />

            {/* Startup Readiness Index (Module 5) */}
            <Route path="readiness" element={<StartupReadinessPage />} />
            <Route path="readiness/:startupId" element={<StartupReadinessPage />} />

            {/* Executive Reports & PDF Generation (Module 6) */}
            <Route path="reports" element={<ReportGenerationPage />} />
            <Route path="reports/:startupId" element={<ReportGenerationPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CurrencyProvider>
    </AuthProvider>
  </Router>
  );
}
