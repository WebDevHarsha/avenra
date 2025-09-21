/**
 * Utility functions for the market simulator
 */

// Format currency values
export function formatCurrency(value: number | string): string {
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value;
  
  // Return N/A if not a valid number
  if (isNaN(numValue) || numValue === null || numValue === undefined) {
    return 'N/A';
  }
  
  if (numValue >= 1e9) {
    return `$${(numValue / 1e9).toFixed(1)}B`;
  }
  if (numValue >= 1e6) {
    return `$${(numValue / 1e6).toFixed(1)}M`;
  }
  if (numValue >= 1e3) {
    return `$${(numValue / 1e3).toFixed(1)}K`;
  }
  return `$${numValue.toFixed(0)}`;
}

// Format percentage values
export function formatPercentage(value: number | string): string {
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[%]/g, '')) : value;
  
  // Return N/A if not a valid number
  if (isNaN(numValue) || numValue === null || numValue === undefined) {
    return 'N/A';
  }
  
  return `${numValue.toFixed(1)}%`;
}

// Calculate risk color based on score
export function getRiskColor(score: number): string {
  if (score >= 70) return 'text-red-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-green-600';
}

// Calculate score color based on value
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

// Validate file types for upload
export function isValidFileType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  return validTypes.includes(file.type);
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function for search/input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// Parse KPIs using Gemini AI with grounding/web search
export async function parseKPIs(text: string): Promise<Partial<import('../types').CompanyKPIs>> {
  try {
    console.log('Using Gemini AI with grounding to extract KPIs...');
    
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    
    // Use Gemini model with grounding capabilities
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [{
        googleSearchRetrieval: {}
      }]
    });

    const prompt = `
As a financial analyst, your task is to extract key performance indicators (KPIs) from the provided pitch deck content.
You MUST use your web search capabilities to find the most recent and accurate information for the company mentioned in the pitch deck.

PITCH DECK CONTENT:
${text}

Based on the content and your web research, extract the following KPIs and return them in a strict JSON format.
If a value is not found, use null.

{
  "companyName": "string or null",
  "sector": "string or null",
  "fundingRound": "string or null",
  "askAmount": number or null,
  "revenue": number or null,
  "growthRate": number or null,
  "teamSize": number or null,
  "marketSize": number or null,
  "customerCount": number or null,
  "burnRate": number or null
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('Gemini response for KPI extraction:', responseText);
    
    // Parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const kpis = JSON.parse(jsonMatch[0]);
        console.log('Extracted KPIs:', kpis);
        return kpis;
      }
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
    }

    // Fallback to basic parsing if AI fails
    console.log('Falling back to basic parsing...');
    return parseKPIsBasic(text);
    
  } catch (error) {
    console.error('Error extracting KPIs with Gemini:', error);
    // Fallback to basic parsing
    return parseKPIsBasic(text);
  }
}

// Fallback basic KPI parsing function
function parseKPIsBasic(text: string): Partial<import('../types').CompanyKPIs> {
  const kpis: Partial<import('../types').CompanyKPIs> = {};
  
  // Basic company name extraction
  const companyNameMatch = text.match(/(?:Company|Startup):\s*([^\n]+)/i) ||
                          text.match(/^([A-Z][a-zA-Z\s&]+)(?:\s(?:Inc|LLC|Corp|Ltd))?/m);
  if (companyNameMatch) {
    kpis.companyName = companyNameMatch[1].trim();
  }

  // Basic sector extraction
  const sectorMatch = text.match(/(?:Sector|Industry|Market):\s*([^\n]+)/i);
  if (sectorMatch) {
    kpis.sector = sectorMatch[1].trim();
  }

  return kpis;
}

// ============================================================================
// DETERMINISTIC SCORING ALGORITHMS
// ============================================================================

/**
 * Calculate Growth Potential Score (0-100) based on KPI data
 */
export function calculateGrowthPotentialScore(kpis: Partial<import('../types').CompanyKPIs>): number {
  let score = 50; // Base score

  // Revenue Analysis (30 points max)
  if (kpis.revenue) {
    const revenueText = kpis.revenue.toLowerCase().trim();
    if (revenueText.includes('billion') || revenueText.includes('b')) {
      score += 30;
    } else if (revenueText.includes('million') || revenueText.includes('m')) {
      // More precise regex to avoid false matches
      const match = revenueText.match(/(\d+(?:\.\d+)?)\s*(?:million|m)(?!\w)/);
      if (match) {
        const amount = parseFloat(match[1]);
        if (amount >= 100) score += 30;
        else if (amount >= 50) score += 25;
        else if (amount >= 10) score += 20;
        else if (amount >= 1) score += 15;
        else score += 10;
      } else {
        score += 15; // Has 'million' but can't parse exact amount
      }
    } else if (revenueText.match(/\d+/)) {
      score += 10; // Some revenue is better than none
    }
  }

  // Market Size Analysis (25 points max)
  if (kpis.marketSize) {
    const marketText = kpis.marketSize.toLowerCase().trim();
    if (marketText.includes('trillion')) {
      score += 25;
    } else if (marketText.includes('billion')) {
      score += 25;
    } else if (marketText.includes('million')) {
      score += 15;
    } else if (marketText.match(/\d+/)) {
      score += 10;
    }
  }

  // Traction Analysis (20 points max)
  if (kpis.traction) {
    const tractionText = kpis.traction.toLowerCase();
    const indicators = ['growth', 'million', 'users', 'customers', 'revenue', 'expansion', 'partnerships'];
    const matches = indicators.filter(indicator => tractionText.includes(indicator));
    score += Math.min(matches.length * 3, 20);
  }

  // Team Size Analysis (10 points max)
  if (kpis.teamSize) {
    const teamText = kpis.teamSize.toLowerCase();
    const match = teamText.match(/(\d+)/);
    if (match) {
      const size = parseInt(match[1]);
      if (size >= 50) score += 10;
      else if (size >= 20) score += 8;
      else if (size >= 10) score += 6;
      else if (size >= 3) score += 4;
    }
  }

  // Funding Stage Analysis (15 points max)
  if (kpis.fundingStage) {
    const stage = kpis.fundingStage.toLowerCase();
    if (stage.includes('series c') || stage.includes('series d') || stage.includes('ipo')) {
      score += 15;
    } else if (stage.includes('series b')) {
      score += 12;
    } else if (stage.includes('series a')) {
      score += 8;
    } else if (stage.includes('seed')) {
      score += 5;
    }
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate Risk Level Score (0-100, higher = more risk)
 */
export function calculateRiskScore(kpis: Partial<import('../types').CompanyKPIs>): number {
  let riskScore = 50; // Base risk

  // Funding Stage Risk
  if (kpis.fundingStage) {
    const stage = kpis.fundingStage.toLowerCase();
    if (stage.includes('seed') || stage.includes('pre-seed')) {
      riskScore += 20; // Higher risk for early stage
    } else if (stage.includes('series a')) {
      riskScore += 10;
    } else if (stage.includes('series b')) {
      riskScore -= 5;
    } else if (stage.includes('series c') || stage.includes('ipo')) {
      riskScore -= 15; // Lower risk for mature stage
    }
  }

  // Revenue Risk (lack of revenue = higher risk)
  if (!kpis.revenue || kpis.revenue.toLowerCase().includes('projected') || 
      kpis.revenue.toLowerCase().includes('estimated')) {
    riskScore += 15;
  } else if (kpis.revenue) {
    const revenueText = kpis.revenue.toLowerCase();
    if (revenueText.includes('million') || revenueText.includes('billion')) {
      riskScore -= 10;
    }
  }

  // Competition Risk
  if (kpis.competition) {
    const competitionText = kpis.competition.toLowerCase();
    const competitors = competitionText.split(',').length;
    if (competitors > 5) {
      riskScore += 15;
    } else if (competitors > 3) {
      riskScore += 10;
    } else if (competitors <= 2) {
      riskScore -= 5;
    }
  }

  // Team Size Risk
  if (kpis.teamSize) {
    const teamText = kpis.teamSize.toLowerCase();
    const match = teamText.match(/(\d+)/);
    if (match) {
      const size = parseInt(match[1]);
      if (size < 3) {
        riskScore += 15; // Very small team = higher risk
      } else if (size >= 10) {
        riskScore -= 5; // Larger team = lower risk
      }
    }
  }

  // Market Size Risk (smaller market = higher risk)
  if (!kpis.marketSize) {
    riskScore += 10;
  } else {
    const marketText = kpis.marketSize.toLowerCase();
    if (!marketText.includes('billion') && !marketText.includes('million')) {
      riskScore += 10;
    }
  }

  return Math.min(Math.max(riskScore, 0), 100);
}

/**
 * Calculate Overall Investment Score (0-100)
 */
export function calculateInvestmentScore(kpis: Partial<import('../types').CompanyKPIs>): number {
  const growthScore = calculateGrowthPotentialScore(kpis);
  const riskScore = calculateRiskScore(kpis);
  const inversedRiskScore = 100 - riskScore; // Lower risk = better score

  // Use integer arithmetic to avoid floating-point precision issues
  // Weighted combination: 60% growth potential, 40% risk-adjusted
  const investmentScore = Math.round((growthScore * 60 + inversedRiskScore * 40) / 100);
  
  return Math.min(Math.max(investmentScore, 0), 100);
}

/**
 * Calculate Confidence Level (0-100) based on data completeness
 */
export function calculateConfidenceScore(kpis: Partial<import('../types').CompanyKPIs>): number {
  let confidencePoints = 0;
  const totalFields = 12; // Number of key fields to check

  const fieldsToCheck = [
    'companyName', 'sector', 'fundingStage', 'revenue', 'teamSize', 
    'marketSize', 'customers', 'competition', 'businessModel', 
    'traction', 'technology', 'geographicMarket'
  ];

  fieldsToCheck.forEach(field => {
    const value = kpis[field as keyof typeof kpis];
    if (value && value.toString().length > 10) { // More detailed = higher confidence
      confidencePoints += 100; // Full points for detailed data
    } else if (value && value.toString().length > 0) {
      confidencePoints += 60; // Partial points for some data
    }
  });

  // Use integer arithmetic to avoid floating-point issues
  const confidence = Math.round(confidencePoints / totalFields);
  return Math.min(confidence, 100);
}

/**
 * Calculate Growth Projections based on market size and traction
 */
export function calculateGrowthProjections(kpis: Partial<import('../types').CompanyKPIs>): {
  year1: number;
  year3: number;
  year5: number;
} {
  let baseGrowth = 25; // Conservative base

  // Adjust based on market size
  if (kpis.marketSize) {
    const marketText = kpis.marketSize.toLowerCase();
    if (marketText.includes('billion') || marketText.includes('trillion')) {
      baseGrowth += 25;
    } else if (marketText.includes('million')) {
      baseGrowth += 15;
    }
  }

  // Adjust based on traction
  if (kpis.traction) {
    const tractionText = kpis.traction.toLowerCase();
    if (tractionText.includes('million')) {
      baseGrowth += 20;
    } else if (tractionText.includes('growth')) {
      baseGrowth += 10;
    }
  }

  // Adjust based on funding stage
  if (kpis.fundingStage) {
    const stage = kpis.fundingStage.toLowerCase();
    if (stage.includes('seed')) {
      baseGrowth += 15; // High growth potential for early stage
    } else if (stage.includes('series a')) {
      baseGrowth += 10;
    }
  }

  const year1 = Math.min(baseGrowth, 80);
  const year3 = Math.min(baseGrowth * 2.5, 200);
  const year5 = Math.min(baseGrowth * 4, 400);

  return {
    year1: Math.round(year1),
    year3: Math.round(year3),
    year5: Math.round(year5)
  };
}

/**
 * Generate deterministic risk assessment
 */
export function generateRiskAssessment(kpis: Partial<import('../types').CompanyKPIs>) {
  const riskScore = calculateRiskScore(kpis);
  
  let overallRisk: 'Low' | 'Medium' | 'High';
  if (riskScore <= 35) overallRisk = 'Low';
  else if (riskScore <= 65) overallRisk = 'Medium';
  else overallRisk = 'High';

  return {
    overallRisk,
    riskScore,
    riskFactors: {
      market: Math.min(Math.max(40 + (kpis.marketSize ? -10 : 10), 0), 100),
      team: Math.min(Math.max(30 + (kpis.teamSize ? parseTeamSize(kpis.teamSize) > 5 ? -10 : 10 : 15), 0), 100),
      financial: Math.min(Math.max(50 + (kpis.revenue ? -15 : 20), 0), 100),
      competitive: Math.min(Math.max(45 + (kpis.competition ? getCompetitionCount(kpis.competition) * 5 : 10), 0), 100),
    }
  };
}

function parseTeamSize(teamSize: string): number {
  const match = teamSize.match(/(\d+)/);
  return match ? parseInt(match[1]) : 3;
}

function getCompetitionCount(competition: string): number {
  return competition.split(',').length;
}

/**
 * Normalize KPI data to ensure consistent processing
 */
export function normalizeKPIData(kpis: any): Partial<import('../types').CompanyKPIs> {
  const normalized: Partial<import('../types').CompanyKPIs> = {};
  
  // Ensure all string fields are properly trimmed and standardized
  if (kpis.companyName) normalized.companyName = String(kpis.companyName).trim();
  if (kpis.sector) normalized.sector = String(kpis.sector).trim();
  if (kpis.fundingStage) normalized.fundingStage = String(kpis.fundingStage).trim();
  if (kpis.revenue) normalized.revenue = String(kpis.revenue).trim();
  if (kpis.teamSize) normalized.teamSize = String(kpis.teamSize).trim();
  if (kpis.marketSize) normalized.marketSize = String(kpis.marketSize).trim();
  if (kpis.customers || kpis.customerCount) {
    normalized.customers = String(kpis.customers || kpis.customerCount).trim();
  }
  if (kpis.competition) normalized.competition = String(kpis.competition).trim();
  if (kpis.businessModel) normalized.businessModel = String(kpis.businessModel).trim();
  if (kpis.traction) normalized.traction = String(kpis.traction).trim();
  if (kpis.technology) normalized.technology = String(kpis.technology).trim();
  if (kpis.geographicMarket) normalized.geographicMarket = String(kpis.geographicMarket).trim();
  if (kpis.keyMetrics) normalized.keyMetrics = String(kpis.keyMetrics).trim();
  if (kpis.fundingRequest) normalized.fundingRequest = String(kpis.fundingRequest).trim();
  if (kpis.useOfFunds) normalized.useOfFunds = String(kpis.useOfFunds).trim();
  
  return normalized;
}

/**
 * Test function to verify scoring consistency
 */
export function testScoringConsistency(kpis: Partial<import('../types').CompanyKPIs>): {
  normalizedKpis: Partial<import('../types').CompanyKPIs>;
  growthScore: number;
  riskScore: number;
  investmentScore: number;
  confidenceScore: number;
  timestamp: string;
} {
  const normalizedKpis = normalizeKPIData(kpis);
  
  return {
    normalizedKpis,
    growthScore: calculateGrowthPotentialScore(normalizedKpis),
    riskScore: calculateRiskScore(normalizedKpis),
    investmentScore: calculateInvestmentScore(normalizedKpis),
    confidenceScore: calculateConfidenceScore(normalizedKpis),
    timestamp: new Date().toISOString()
  };
}