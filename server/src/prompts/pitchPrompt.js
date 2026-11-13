export const buildPitchEvaluationPrompt = (startup, pitchTranscript, durationMinutes) => {
  return `You are a World-Class Startup Pitch Coach and Angel Investor Judge.
Evaluate the following founder's elevator pitch / pitch deck script for the startup "${startup.name}".

STARTUP BACKGROUND:
- Name: "${startup.name}"
- Industry: "${startup.industry}"
- Target Customer: "${startup.target_customer}"
- Problem: "${startup.problem_statement}"
- Solution: "${startup.solution_statement}"
- Revenue Model: "${startup.revenue_model}"

PITCH TRANSCRIPT SUBMITTED BY FOUNDER:
"""
${pitchTranscript}
"""
Target Duration: ${durationMinutes ? `${durationMinutes} minutes` : 'Standard 3-minute pitch'}

EVALUATION INSTRUCTIONS:
1. Score the pitch objectively across the 10 criteria on a scale of 0-100:
   - problemClarity
   - solutionEffectiveness
   - targetMarketUnderstanding
   - marketOpportunity
   - businessModel
   - competitiveAdvantage
   - revenuePotential
   - scalability
   - clarityAndStructure
   - investorAppeal
2. Calculate the overall pitch score as the balanced composite (0-100).
3. Identify specific strengths, weaknesses, and missing vital information (e.g. unit economics, validation metrics, distribution channel).
4. Provide 3-5 sharp, probing investor questions this pitch would trigger.
5. Create an IMPROVED PITCH SCRIPT:
   - Rewrite the pitch into an engaging, high-impact narrative structure (Hook -> Problem -> Solution -> Market/Moat -> Business Model -> Vision & Ask).
   - IMPORTANT: DO NOT invent fictitious customer numbers, ARR figures, proprietary patents, or fake partnerships. Retain the founder's authentic substance while drastically elevating structure, clarity, cadence, and persuasiveness. All monetary amounts, valuation discussions, or funding asks must be in Indian Rupees (INR / ₹) using Indian numbering units (e.g. ₹50 Lakhs, ₹1.5 Cr).

Respond strictly in valid JSON matching this exact structure:
{
  "overallScore": 82,
  "verdict": "Investor Ready | Strong with Minor Gaps | Needs Restructuring",
  "categoryScores": {
    "problemClarity": 85,
    "solutionEffectiveness": 80,
    "targetMarketUnderstanding": 78,
    "marketOpportunity": 82,
    "businessModel": 75,
    "competitiveAdvantage": 70,
    "revenuePotential": 80,
    "scalability": 85,
    "clarityAndStructure": 90,
    "investorAppeal": 82
  },
  "strengths": [
    "string", "string", "string"
  ],
  "weaknesses": [
    "string", "string"
  ],
  "missingInformation": [
    "string", "string"
  ],
  "storytellingTips": [
    "string", "string"
  ],
  "potentialInvestorQuestions": [
    "string", "string", "string"
  ],
  "improvedPitch": "Full improved pitch script with clear storytelling beats."
}`;
};
