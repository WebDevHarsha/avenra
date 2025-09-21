import { NextRequest, NextResponse } from 'next/server';
import { 
  calculateGrowthPotentialScore, 
  calculateRiskScore, 
  calculateInvestmentScore, 
  calculateConfidenceScore,
  normalizeKPIData
} from '../../../lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { kpis } = await request.json();

    if (!kpis) {
      return NextResponse.json(
        { error: 'KPI data is required' },
        { status: 400 }
      );
    }

    console.log('Debug - Original KPIs:', kpis);

    // Normalize the data
    const normalizedKpis = normalizeKPIData(kpis);
    console.log('Debug - Normalized KPIs:', normalizedKpis);

    // Calculate each score step by step with detailed logging
    const growthScore = calculateGrowthPotentialScore(normalizedKpis);
    console.log('Debug - Growth Score:', growthScore);

    const riskScore = calculateRiskScore(normalizedKpis);
    console.log('Debug - Risk Score:', riskScore);

    const investmentScore = calculateInvestmentScore(normalizedKpis);
    console.log('Debug - Investment Score:', investmentScore);

    const confidenceScore = calculateConfidenceScore(normalizedKpis);
    console.log('Debug - Confidence Score:', confidenceScore);

    // Run multiple times to check for consistency
    const results = [];
    for (let i = 0; i < 5; i++) {
      const testNormalized = normalizeKPIData(kpis);
      results.push({
        run: i + 1,
        growthScore: calculateGrowthPotentialScore(testNormalized),
        riskScore: calculateRiskScore(testNormalized),
        investmentScore: calculateInvestmentScore(testNormalized),
        confidenceScore: calculateConfidenceScore(testNormalized)
      });
    }

    // Check consistency
    const firstResult = results[0];
    const isConsistent = results.every(result => 
      result.growthScore === firstResult.growthScore &&
      result.riskScore === firstResult.riskScore &&
      result.investmentScore === firstResult.investmentScore &&
      result.confidenceScore === firstResult.confidenceScore
    );

    return NextResponse.json({
      success: true,
      originalKpis: kpis,
      normalizedKpis,
      scores: {
        growthScore,
        riskScore,
        investmentScore,
        confidenceScore
      },
      multipleRuns: results,
      consistent: isConsistent,
      message: isConsistent 
        ? 'All scores are consistent across multiple runs' 
        : 'WARNING: Scores are inconsistent!'
    });

  } catch (error) {
    console.error('Debug scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to debug scoring', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}