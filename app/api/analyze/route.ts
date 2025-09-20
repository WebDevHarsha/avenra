import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini, createAnalysisPrompt } from '../../../lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { extractedText, companyData, marketData } = await request.json();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'Extracted text is required for analysis' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Create comprehensive analysis prompt
    const analysisPrompt = createAnalysisPrompt(companyData, marketData, extractedText);

    // Get AI analysis from Gemini
    const geminiResponse = await analyzeWithGemini(analysisPrompt);

    // Parse the JSON response from Gemini
    let analysisData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback: create a basic analysis structure
      analysisData = createFallbackAnalysis(extractedText, companyData);
    }

    // Validate and sanitize the analysis data
    const sanitizedAnalysis = sanitizeAnalysisData(analysisData);

    return NextResponse.json({
      success: true,
      data: {
        ...sanitizedAnalysis,
        timestamp: new Date().toISOString(),
        id: generateAnalysisId(),
      },
    });

  } catch (error) {
    console.error('Gemini analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze with AI', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function createFallbackAnalysis(extractedText: string, companyData: any) {
  // Basic fallback analysis when Gemini parsing fails
  return {
    growthPotential: {
      score: 65,
      factors: ['Market opportunity', 'Team experience'],
      projectedGrowth: { year1: 25, year3: 75, year5: 150 },
      keyDrivers: ['Product innovation', 'Market expansion']
    },
    riskAssessment: {
      overallRisk: 'Medium',
      riskScore: 45,
      redFlags: ['Competition risk', 'Market timing'],
      mitigationStrategies: ['Strengthen competitive moat', 'Accelerate go-to-market'],
      riskFactors: { market: 50, team: 30, financial: 40, competitive: 60 }
    },
    marketAnalysis: {
      marketTrends: ['Digital transformation', 'Remote work adoption'],
      competitivePosition: 'Emerging player with differentiated approach',
      marketSize: 1000000000,
      growthRate: 15,
      opportunities: ['Market expansion', 'Product diversification'],
      threats: ['Increased competition', 'Economic uncertainty']
    },
    recommendations: [
      {
        type: 'growth',
        priority: 'High',
        title: 'Accelerate Product Development',
        description: 'Focus on core product features to establish market position',
        expectedImpact: 'Improved market competitiveness',
        timeline: '6-12 months'
      }
    ],
    overallScore: 72,
    confidence: 75
  };
}

function sanitizeAnalysisData(data: any) {
  // Ensure all required fields exist with proper types
  return {
    growthPotential: {
      score: Math.min(Math.max(data.growthPotential?.score || 50, 0), 100),
      factors: Array.isArray(data.growthPotential?.factors) ? data.growthPotential.factors : [],
      projectedGrowth: {
        year1: Math.max(data.growthPotential?.projectedGrowth?.year1 || 10, 0),
        year3: Math.max(data.growthPotential?.projectedGrowth?.year3 || 30, 0),
        year5: Math.max(data.growthPotential?.projectedGrowth?.year5 || 60, 0)
      },
      keyDrivers: Array.isArray(data.growthPotential?.keyDrivers) ? data.growthPotential.keyDrivers : []
    },
    riskAssessment: {
      overallRisk: ['Low', 'Medium', 'High'].includes(data.riskAssessment?.overallRisk) 
        ? data.riskAssessment.overallRisk : 'Medium',
      riskScore: Math.min(Math.max(data.riskAssessment?.riskScore || 50, 0), 100),
      redFlags: Array.isArray(data.riskAssessment?.redFlags) ? data.riskAssessment.redFlags : [],
      mitigationStrategies: Array.isArray(data.riskAssessment?.mitigationStrategies) 
        ? data.riskAssessment.mitigationStrategies : [],
      riskFactors: {
        market: Math.min(Math.max(data.riskAssessment?.riskFactors?.market || 50, 0), 100),
        team: Math.min(Math.max(data.riskAssessment?.riskFactors?.team || 50, 0), 100),
        financial: Math.min(Math.max(data.riskAssessment?.riskFactors?.financial || 50, 0), 100),
        competitive: Math.min(Math.max(data.riskAssessment?.riskFactors?.competitive || 50, 0), 100)
      }
    },
    marketAnalysis: {
      marketTrends: Array.isArray(data.marketAnalysis?.marketTrends) ? data.marketAnalysis.marketTrends : [],
      competitivePosition: data.marketAnalysis?.competitivePosition || 'Position analysis pending',
      marketSize: Math.max(data.marketAnalysis?.marketSize || 0, 0),
      growthRate: Math.max(data.marketAnalysis?.growthRate || 0, 0),
      opportunities: Array.isArray(data.marketAnalysis?.opportunities) ? data.marketAnalysis.opportunities : [],
      threats: Array.isArray(data.marketAnalysis?.threats) ? data.marketAnalysis.threats : []
    },
    recommendations: Array.isArray(data.recommendations) ? data.recommendations.map((rec: any) => ({
      type: ['investment', 'growth', 'risk-mitigation', 'market-strategy'].includes(rec.type) 
        ? rec.type : 'growth',
      priority: ['High', 'Medium', 'Low'].includes(rec.priority) ? rec.priority : 'Medium',
      title: rec.title || 'Recommendation',
      description: rec.description || 'Description pending',
      expectedImpact: rec.expectedImpact || 'Impact analysis pending',
      timeline: rec.timeline || 'Timeline to be determined'
    })) : [],
    overallScore: Math.min(Math.max(data.overallScore || 50, 0), 100),
    confidence: Math.min(Math.max(data.confidence || 75, 0), 100)
  };
}

function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}