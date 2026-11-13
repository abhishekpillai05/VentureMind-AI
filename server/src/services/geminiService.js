import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { formatCurrency, SYMBOLS } from '../utils/formatters.js';
import {
  buildValidatorSystemPrompt,
  buildValidatorUserPrompt,
} from '../prompts/validatorPrompt.js';
import { aiValidationResponseSchema } from '../validators/validationValidator.js';
import { buildMarketResearchPrompt } from '../prompts/marketPrompt.js';
import {
  buildInvestorChatPrompt,
  buildInvestorEvaluationPrompt,
} from '../prompts/investorPrompt.js';
import { buildPitchEvaluationPrompt } from '../prompts/pitchPrompt.js';

let genAIClient = null;

const getGenAIClient = () => {
  if (!genAIClient) {
    if (!ENV.GEMINI.API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in server/.env');
    }
    genAIClient = new GoogleGenAI({ apiKey: ENV.GEMINI.API_KEY });
  }
  return genAIClient;
};

// Clean string if wrapped in markdown code blocks
const extractJSONText = (raw) => {
  if (!raw) return '';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
];

// Reusable JSON generator across all modules
const executeGeminiJSON = async (promptText, contextName = 'AI Request') => {
  const client = getGenAIClient();
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out after 35 seconds')), 35000)
      );

      const generatePromise = client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response.text;
      if (!rawText) throw new Error('Empty response received from AI model');

      const jsonString = extractJSONText(rawText);
      const parsedData = JSON.parse(jsonString);
      return parsedData;
    } catch (err) {
      console.warn(`⚠️ [${model}] ${contextName} notice: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`AI generation failed: ${lastError?.message || 'Service unavailable'}`);
};

// Reusable conversational text generator for investor chat
const executeGeminiText = async (promptText, contextName = 'AI Text') => {
  const client = getGenAIClient();
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out after 25 seconds')), 25000)
      );

      const generatePromise = client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          temperature: 0.7, // Higher temperature for natural, realistic investor dialogue
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response.text;
      if (!rawText) throw new Error('Empty response received from AI model');
      return rawText.trim();
    } catch (err) {
      console.warn(`⚠️ [${model}] ${contextName} notice: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`AI conversation failed: ${lastError?.message || 'Service unavailable'}`);
};

// 1. Idea Validator
export const validateStartupIdeaWithAI = async (startup) => {
  const systemPrompt = buildValidatorSystemPrompt();
  const userPrompt = buildValidatorUserPrompt(startup);
  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  const parsed = await executeGeminiJSON(prompt, `Idea Validator [${startup.name}]`);
  const validated = aiValidationResponseSchema.parse(parsed);
  return validated;
};

// 2. Market Research & Competitor Analysis
export const generateMarketResearchWithAI = async (startup) => {
  const prompt = buildMarketResearchPrompt(startup);
  const data = await executeGeminiJSON(prompt, `Market Research [${startup.name}]`);
  return data;
};

// 3. Investor Chat Turn
export const generateInvestorChatResponseWithAI = async (startup, persona, messageHistory) => {
  const prompt = buildInvestorChatPrompt(startup, persona, messageHistory);
  const reply = await executeGeminiText(prompt, `Investor Chat [${persona}]`);
  return reply;
};

// 4. Investor Session Evaluation
export const generateInvestorSessionEvaluationWithAI = async (startup, persona, messageHistory) => {
  const prompt = buildInvestorEvaluationPrompt(startup, persona, messageHistory);
  const data = await executeGeminiJSON(prompt, `Investor Debrief [${persona}]`);
  return data;
};

// 5. Pitch Evaluation
export const evaluatePitchWithAI = async (startup, pitchTranscript, durationMinutes) => {
  const prompt = buildPitchEvaluationPrompt(startup, pitchTranscript, durationMinutes);
  const data = await executeGeminiJSON(prompt, `Pitch Evaluation [${startup.name}]`);
  return data;
};

// 6. Financial Narrative & Optimization Advice
export const explainFinancialResultsWithAI = async (
  startup,
  financialResults,
  targetCurrency = 'INR',
  rates = null
) => {
  const curr = targetCurrency?.toUpperCase() || 'INR';
  const sym = SYMBOLS[curr] || '₹';
  const fmt = (amt) => formatCurrency(amt, curr, false, rates);

  const prompt = `You are a Fractional CFO. Review the following startup's deterministic financial forecast and unit economics:
STARTUP: "${startup.name}" (${startup.industry})
CURRENCY: ${curr} (${sym})
METRICS:
- Price: ${fmt(financialResults.price)} ${curr}
- CAC: ${fmt(financialResults.cac)} ${curr}
- LTV: ${fmt(financialResults.netLtv || financialResults.ltv)} ${curr} (Ratio: ${financialResults.ltvCacRatio}x)
- Payback Period: ${financialResults.paybackMonths} months
- Monthly Fixed Costs: ${fmt(financialResults.fixedMonthlyCosts)} ${curr}
- Variable Cost Per Customer: ${fmt(financialResults.variableCostPerCustomer)} ${curr}
- Break-Even Customer Volume: ${financialResults.breakEvenCustomers} customers
- Month 12 Net Profit (Realistic): ${fmt(financialResults.forecasts?.realistic?.[11]?.netProfit || 0)} ${curr}

IMPORTANT RULES:
- Discuss all monetary figures strictly in ${curr} (${sym}). Do not invent fictitious financial figures or make arbitrary currency conversions.
- Non-monetary figures (ratios, percentages, months, customers, scores) must remain exact and unconverted.

Provide an executive CFO critique in JSON format:
{
  "unitEconomicsHealth": "Healthy | Warning | Critical",
  "commentary": "2-3 paragraphs analyzing cash runway, contribution margin, and capital efficiency.",
  "strategicRecommendations": ["string", "string", "string"],
  "financialReadinessScore": 80
}`;

  const data = await executeGeminiJSON(prompt, `CFO Financial Analysis [${startup.name}]`);
  return data;
};
