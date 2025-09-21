import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

// ✅ Initialize client with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// 🔹 Helper to analyze with or without grounding
export async function analyzeWithGemini(
  prompt: string,
  useGrounding: boolean = false
): Promise<string> {
  try {
    // Grounding tool
    const groundingTool = { googleSearch: {} };

    // Config for grounded queries
    const config = useGrounding ? { tools: [groundingTool] } : {};

    // ✅ Request
    const response = await ai.models.generateContent({
      // model: useGrounding ? "gemini-2.5-flash" : "gemini-1.5-flash",
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config,
    });

    if (!response || !response.text) {
      throw new Error("No response received from Gemini AI");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze with Gemini AI");
  }
}

// 🔹 Custom prompt builder
export function createAnalysisPrompt(
  companyData: Partial<import('../types').CompanyKPIs> | undefined,
  marketData: Partial<import('../types').MarketData> | undefined,
  extractedText: string
): string {
  return `
As an expert venture capital analyst, analyze this startup pitch deck and provide a comprehensive investment analysis.

COMPANY DATA:
${JSON.stringify(companyData, null, 2)}

MARKET CONTEXT:
${JSON.stringify(marketData, null, 2)}

PITCH DECK CONTENT:
${extractedText}

If the provided data is incomplete, use web search capabilities to find the latest information about the company and its KPIs.

Please provide a detailed analysis in the following JSON format:
{
  "growthPotential": {
    "score": <0-100>,
    "factors": [<array of key growth factors>],
    "projectedGrowth": {
      "year1": <percentage>,
      "year3": <percentage>,
      "year5": <percentage>
    },
    "keyDrivers": [<array of growth drivers>]
  },
  "riskAssessment": {
    "overallRisk": "<Low|Medium|High>",
    "riskScore": <0-100>,
    "redFlags": [<array of concerning issues>],
    "mitigationStrategies": [<array of risk mitigation suggestions>],
    "riskFactors": {
      "market": <0-100>,
      "team": <0-100>,
      "financial": <0-100>,
      "competitive": <0-100>
    }
  },
  "marketAnalysis": {
    "marketTrends": [<array of relevant trends>],
    "competitivePosition": "<description>",
    "marketSize": <number>,
    "growthRate": <percentage>,
    "opportunities": [<array of opportunities>],
    "threats": [<array of threats>]
  },
  "recommendations": [
    {
      "type": "<investment|growth|risk-mitigation|market-strategy>",
      "priority": "<High|Medium|Low>",
      "title": "<recommendation title>",
      "description": "<detailed description>",
      "expectedImpact": "<impact description>",
      "timeline": "<timeline for implementation>"
    }
  ],
  "overallScore": <0-100>,
  "confidence": <0-100>
}

Focus on providing actionable insights for investors, considering market conditions, competitive landscape, team capabilities, and financial projections.
  `;
}
