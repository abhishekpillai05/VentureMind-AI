import { z } from 'zod';

export const aiValidationResponseSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  verdict: z.string().min(3),
  summary: z.string().min(10),
  scores: z.object({
    problemSolutionFit: z.number().int().min(0).max(100),
    targetAudience: z.number().int().min(0).max(100),
    marketOpportunity: z.number().int().min(0).max(100),
    competition: z.number().int().min(0).max(100),
    businessModel: z.number().int().min(0).max(100),
    feasibility: z.number().int().min(0).max(100),
  }),
  problemSolutionAnalysis: z.object({
    problemClarity: z.string().default(''),
    problemSignificance: z.string().default(''),
    solutionViability: z.string().default(''),
    practicalityVerdict: z.string().default(''),
  }),
  targetAudienceAnalysis: z.object({
    primarySegment: z.string().default(''),
    needsAndPainPoints: z.string().default(''),
    specificityRating: z.string().default('Medium'),
    insights: z.string().default(''),
  }),
  marketOpportunityAnalysis: z.object({
    estimatedScope: z.string().default(''),
    keyTrends: z.array(z.string()).default([]),
    demandSignals: z.string().default(''),
    disclaimer: z
      .string()
      .default('AI-generated strategic estimate based on current industry benchmarks.'),
  }),
  competitionAnalysis: z.object({
    competitorCategories: z.array(z.string()).default([]),
    defensibilityMoat: z.string().default(''),
    differentiationOpportunities: z.string().default(''),
  }),
  swot: z.object({
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()).min(1),
    opportunities: z.array(z.string()).min(1),
    threats: z.array(z.string()).min(1),
  }),
  businessModelAnalysis: z.object({
    revenueModelEvaluation: z.string().default(''),
    suggestedMonetization: z.array(z.string()).default([]),
    potentialVulnerabilities: z.string().default(''),
  }),
  feasibilityAnalysis: z.object({
    technical: z.string().default(''),
    financial: z.string().default(''),
    operational: z.string().default(''),
    market: z.string().default(''),
  }),
  risks: z
    .array(
      z.object({
        category: z.string(),
        description: z.string(),
        mitigation: z.string().optional().default(''),
      })
    )
    .default([]),
  recommendations: z
    .array(
      z.object({
        title: z.string(),
        priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
        description: z.string(),
      })
    )
    .min(1),
  nextSteps: z.array(z.string()).min(1),
});
