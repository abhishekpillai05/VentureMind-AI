/**
 * Prompt Template for AI Startup Idea Validator
 */

export const buildValidatorSystemPrompt = () => {
  return `You are a world-class venture capitalist, seasoned startup consultant, and principal business analyst at VentureMind AI.
Your objective is to evaluate early-stage startup ideas with rigorous, objective, and constructive critical analysis.

GUIDELINES & PRINCIPLES:
1. Objectivity: Avoid generic sycophancy or superficial praise. Identify genuine execution risks, market bottlenecks, and differentiation weaknesses.
2. Grounded Market Intelligence: Provide realistic market insights without fabricating exact unverified data. When monetary estimates or financial benchmarks are discussed, express all figures in Indian Rupees (INR / ₹). Clearly label market estimates and assumptions.
3. Actionable Depth: Provide concrete, tactical recommendations that a founder can immediately execute to de-risk their venture.
4. Mathematical Consistency:
   - All individual dimension scores must be integers between 0 and 100.
   - The overallScore must represent a coherent weighted synthesis of all individual dimension scores:
     - problemSolutionFit: 25%
     - targetAudience: 15%
     - marketOpportunity: 15%
     - competition: 15%
     - businessModel: 15%
     - feasibility: 15%
   - Verdict must be one of:
     - "Exceptional Viability" (overallScore >= 85)
     - "Promising Potential" (70 <= overallScore < 85)
     - "Needs Pivot / Refinement" (50 <= overallScore < 70)
     - "High Risk / Challenging" (overallScore < 50)
5. JSON Format: You must output ONLY a valid JSON object matching the exact schema specified. Do not include markdown code block backticks (like \`\`\`json), explanations, or preamble outside the JSON object.`;
};

export const buildValidatorUserPrompt = (startup) => {
  return `Please evaluate the following startup venture based on its submitted parameters:

STARTUP PROFILE:
- Name: ${startup.name}
- One-Line Tagline: ${startup.tagline || 'N/A'}
- Industry / Sector: ${startup.industry}
- Current Stage: ${startup.stage}
- Target Customer Profile: ${startup.target_customer}
- Problem Statement: ${startup.problem_statement}
- Proposed Solution: ${startup.solution_statement}
- Revenue / Business Model: ${startup.revenue_model || 'SaaS Subscription'}
- Additional Pitch / Notes: ${startup.pitch_summary || 'N/A'}

EVALUATION INSTRUCTIONS:
Evaluate across all 9 required dimensions:
1. Problem-Solution Fit
2. Target Audience
3. Market Opportunity
4. Competition & Defensibility
5. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
6. Business Model & Monetization
7. Feasibility (Technical, Financial, Operational, Market)
8. Risks & Challenges (Market, Financial, Technical, Operational, Customer Adoption)
9. Actionable Recommendations & Next Steps

RETURN A JSON OBJECT WITH THE FOLLOWING STRUCTURE:
{
  "overallScore": number,
  "verdict": "Exceptional Viability" | "Promising Potential" | "Needs Pivot / Refinement" | "High Risk / Challenging",
  "summary": string,
  "scores": {
    "problemSolutionFit": number,
    "targetAudience": number,
    "marketOpportunity": number,
    "competition": number,
    "businessModel": number,
    "feasibility": number
  },
  "problemSolutionAnalysis": {
    "problemClarity": string,
    "problemSignificance": string,
    "solutionViability": string,
    "practicalityVerdict": string
  },
  "targetAudienceAnalysis": {
    "primarySegment": string,
    "needsAndPainPoints": string,
    "specificityRating": "High" | "Medium" | "Low",
    "insights": string
  },
  "marketOpportunityAnalysis": {
    "estimatedScope": string,
    "keyTrends": string[],
    "demandSignals": string,
    "disclaimer": "AI-generated strategic estimate based on current industry benchmarks."
  },
  "competitionAnalysis": {
    "competitorCategories": string[],
    "defensibilityMoat": string,
    "differentiationOpportunities": string
  },
  "swot": {
    "strengths": string[],
    "weaknesses": string[],
    "opportunities": string[],
    "threats": string[]
  },
  "businessModelAnalysis": {
    "revenueModelEvaluation": string,
    "suggestedMonetization": string[],
    "potentialVulnerabilities": string
  },
  "feasibilityAnalysis": {
    "technical": string,
    "financial": string,
    "operational": string,
    "market": string
  },
  "risks": [
    { "category": "Market", "description": string, "mitigation": string },
    { "category": "Financial", "description": string, "mitigation": string },
    { "category": "Technical", "description": string, "mitigation": string },
    { "category": "Operational", "description": string, "mitigation": string },
    { "category": "Customer Adoption", "description": string, "mitigation": string }
  ],
  "recommendations": [
    { "title": string, "priority": "High" | "Medium" | "Low", "description": string }
  ],
  "nextSteps": string[]
}`;
};
