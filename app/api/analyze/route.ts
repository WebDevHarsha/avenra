import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini, createAnalysisPrompt } from '../../../lib/gemini';
import { 
  calculateGrowthPotentialScore, 
  calculateRiskScore, 
  calculateInvestmentScore, 
  calculateConfidenceScore,
  calculateGrowthProjections,
  generateRiskAssessment,
  normalizeKPIData
} from '../../../lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { extractedText, companyData, marketData } = await request.json();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'Extracted text is required for analysis' },
        { status: 400 }
      );
    }

    console.log('Starting deterministic analysis with KPI data:', companyData);

    // Normalize KPI data to ensure consistency
    const normalizedKpis = normalizeKPIData(companyData);
    console.log('Normalized KPIs:', normalizedKpis);

    // Generate deterministic scores based on normalized KPI data
    const growthScore = calculateGrowthPotentialScore(normalizedKpis);
    const riskScore = calculateRiskScore(normalizedKpis);
    const investmentScore = calculateInvestmentScore(normalizedKpis);
    const confidenceScore = calculateConfidenceScore(normalizedKpis);
    const growthProjections = calculateGrowthProjections(normalizedKpis);
    const riskAssessment = generateRiskAssessment(normalizedKpis);

    // Generate qualitative insights using AI (but keep scores deterministic)
    let qualitativeInsights;
    try {
      const analysisPrompt = createAnalysisPrompt(companyData, marketData, extractedText);
      const geminiResponse = await analyzeWithGemini(analysisPrompt);
      
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qualitativeInsights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to get AI insights, using fallback:', parseError);
      qualitativeInsights = createFallbackAnalysis(extractedText, companyData);
    }

    // Combine deterministic scores with AI-generated qualitative insights
    const deterministicAnalysis = {
      growthPotential: {
        score: growthScore, // Deterministic
        factors: qualitativeInsights.growthPotential?.factors || [
          'Market opportunity', 'Business model strength', 'Traction metrics'
        ],
        projectedGrowth: growthProjections, // Deterministic
        keyDrivers: qualitativeInsights.growthPotential?.keyDrivers || [
          'Product innovation', 'Market expansion', 'Customer acquisition'
        ]
      },
      riskAssessment: {
        ...riskAssessment, // Deterministic overall structure
        redFlags: qualitativeInsights.riskAssessment?.redFlags || [
          'Market competition', 'Execution risk'
        ],
        mitigationStrategies: qualitativeInsights.riskAssessment?.mitigationStrategies || [
          'Strengthen competitive moat', 'Focus on product-market fit'
        ]
      },
      marketAnalysis: qualitativeInsights.marketAnalysis || {
        marketTrends: ['Digital transformation', 'Market expansion'],
        competitivePosition: 'Emerging player with differentiated approach',
        marketSize: 1000000000,
        growthRate: 15,
        opportunities: ['Market expansion', 'Product diversification'],
        threats: ['Increased competition', 'Economic uncertainty']
      },
      recommendations: qualitativeInsights.recommendations || [
        {
          type: 'growth',
          priority: 'High',
          title: 'Accelerate Product Development',
          description: 'Focus on core product features to establish market position',
          expectedImpact: 'Improved market competitiveness',
          timeline: '6-12 months'
        }
      ],
      overallScore: investmentScore, // Deterministic
      confidence: confidenceScore // Deterministic
    };

    console.log('Generated deterministic scores:', {
      growthScore,
      riskScore,
      investmentScore,
      confidenceScore
    });

    return NextResponse.json({
      success: true,
      data: {
        ...deterministicAnalysis,
        timestamp: new Date().toISOString(),
        id: generateAnalysisId(),
      },
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze', details: error instanceof Error ? error.message : 'Unknown error' },
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