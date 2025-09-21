import { NextRequest, NextResponse } from 'next/server';
import { testScoringConsistency } from '../../../lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { kpis } = await request.json();

    if (!kpis) {
      return NextResponse.json(
        { error: 'KPI data is required for testing' },
        { status: 400 }
      );
    }

    // Run the scoring multiple times to verify consistency
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(testScoringConsistency(kpis));
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check if all scores are identical (timestamps will differ)
    const firstResult = results[0];
    const isConsistent = results.every(result => 
      result.growthScore === firstResult.growthScore &&
      result.riskScore === firstResult.riskScore &&
      result.investmentScore === firstResult.investmentScore &&
      result.confidenceScore === firstResult.confidenceScore
    );

    return NextResponse.json({
      success: true,
      consistent: isConsistent,
      results,
      message: isConsistent 
        ? 'Scoring algorithm is consistent across multiple runs!' 
        : 'Warning: Scoring algorithm shows inconsistency'
    });

  } catch (error) {
    console.error('Test consistency error:', error);
    return NextResponse.json(
      { error: 'Failed to test consistency', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}