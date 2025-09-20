import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { extractedText } = await request.json();

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Extracted text is required for KPI analysis' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Create KPI extraction prompt with grounding
    const kpiPrompt = `
Analyze the following pitch deck content and extract key performance indicators (KPIs) and company information. Use web search to find additional context about the company if mentioned by name.

Pitch Deck Content:
${extractedText}

Please extract and research the following information, returning it as a JSON object:

{
  "companyName": "Extract the company name",
  "sector": "Identify the industry/sector",
  "fundingStage": "Determine funding stage (pre-seed, seed, series A, etc.)",
  "teamSize": "Extract team size if mentioned",
  "revenue": "Extract current revenue/ARR if mentioned", 
  "customers": "Extract number of customers/users if mentioned",
  "marketSize": "Extract total addressable market (TAM) if mentioned",
  "competition": "List main competitors if mentioned",
  "businessModel": "Describe the business model",
  "keyMetrics": "Extract any other important metrics mentioned",
  "fundingRequest": "Extract funding amount being requested",
  "useOfFunds": "Extract how funding will be used",
  "traction": "Extract traction metrics (growth rate, user adoption, etc.)",
  "technology": "Extract key technologies or innovations mentioned",
  "geographicMarket": "Extract target geographic markets"
}

If specific information is not found in the pitch deck, use "N/A" for that field. Use web search to validate and enhance the information where possible.
`;

    console.log('Extracting KPIs with Gemini grounding...');
    const geminiResponse = await analyzeWithGemini(kpiPrompt, true); // Enable grounding

    // Parse the JSON response
    let kpiData;
    try {
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : geminiResponse;
      kpiData = JSON.parse(jsonString);
      console.log(kpiData);
    } catch (parseError) {
      console.error('Error parsing Gemini KPI response:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse KPI analysis response' },
        { status: 500 }
      );
    }

    console.log('KPI extraction completed:', kpiData);

    return NextResponse.json({
      success: true,
      data: kpiData
    });

  } catch (error) {
    console.error('KPI extraction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract KPIs' },
      { status: 500 }
    );
  }
}