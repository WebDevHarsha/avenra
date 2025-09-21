// app/api/kpis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { extractedText } = await req.json();

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Extracted text is required for KPI analysis" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Prompt for Gemini with grounding
    const kpiPrompt = `
    NEVER LEAVE A FIELD AS "N/A".
Analyze the following pitch deck content and extract key performance indicators (KPIs) and company information. 
If the pitch deck does not explicitly contain the requested data, perform a web search using your Google Search grounding tool to find and fill in the information.

Pitch Deck Content:
${extractedText}

Please extract and research the following information, returning it as a JSON object:

{
  "companyName": "Extract the company name (use search if missing)",
  "sector": "Identify the industry/sector (use search if missing)",
  "fundingStage": "Determine funding stage (pre-seed, seed, series A, etc.) — use search if not in deck",
  "teamSize": "Extract team size (use search if missing)",
  "revenue": "Extract current revenue/ARR (use search if missing)", 
  "customers": "Extract number of customers/users (use search if missing)",
  "marketSize": "Extract total addressable market (TAM) (use search if missing)",
  "competition": "List main competitors (use search if missing)",
  "businessModel": "Describe the business model (use search if missing)",
  "keyMetrics": "Extract any other important metrics (use search if missing)",
  "fundingRequest": "Extract funding amount being requested (use search if missing)",
  "useOfFunds": "Extract how funding will be used (use search if missing)",
  "traction": "Extract traction metrics like growth rate or adoption (use search if missing)",
  "technology": "Extract key technologies or innovations (use search if missing)",
  "geographicMarket": "Extract target geographic markets (use search if missing)"
}

Important:
- Never leave a field as "N/A".
- Always attempt a web search to fill missing values.
- If multiple sources exist, use the most recent and reliable data.
- Ensure all output is valid JSON only, no extra commentary.
`;

    console.log("Extracting KPIs with Gemini + grounding...");

    const geminiResponse = await analyzeWithGemini(kpiPrompt, true); // ✅ enable grounding

    let kpiData;
    try {
      // Extract JSON from possible markdown fences
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : geminiResponse;
      kpiData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Gemini KPI JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Failed to parse Gemini KPI response" },
        { status: 500 }
      );
    }

    console.log("✅ KPI extraction completed:", kpiData);

    return NextResponse.json({ success: true, data: kpiData });
  } catch (error: unknown) {
    console.error("KPI extraction error:", error instanceof Error ? error.message : error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message || "Failed to extract KPIs" },
      { status: 500 }
    );
  }
}
