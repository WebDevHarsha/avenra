/**
 * Utility functions for the market simulator
 */

// Format currency values
export function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// Format percentage values
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
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

// Validate environment variables
export function validateEnvVars(): void {
  const requiredVars = [
    'NEWS_API',
    'FIRECRAWLER_API',
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
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

// Parse KPIs from extracted text using regex and keywords
export function parseKPIs(text: string): Partial<import('../types').CompanyKPIs> {
  const kpis: Partial<import('../types').CompanyKPIs> = {};
  
  // Company name (usually in first few lines or after "Company:" etc.)
  const companyNameMatch = text.match(/(?:Company|Startup):\s*([^\n]+)/i) ||
                          text.match(/^([A-Z][a-zA-Z\s]+)(?:\n|\s-)/m);
  if (companyNameMatch) {
    kpis.companyName = companyNameMatch[1].trim();
  }

  // Sector/Industry
  const sectorMatch = text.match(/(?:Sector|Industry|Market):\s*([^\n]+)/i);
  if (sectorMatch) {
    kpis.sector = sectorMatch[1].trim();
  }

  // Funding round and amount
  const fundingMatch = text.match(/(?:Series [A-Z]|Seed|Pre-seed|Angel)/i);
  if (fundingMatch) {
    kpis.fundingRound = fundingMatch[0];
  }

  // Ask amount (looking for $ followed by numbers)
  const askMatch = text.match(/(?:asking|raising|seeking)\s*\$?([\d.,]+)\s*(?:million|M|k|thousand)?/i);
  if (askMatch) {
    let amount = parseFloat(askMatch[1].replace(/,/g, ''));
    if (text.toLowerCase().includes('million') || text.toLowerCase().includes('M')) {
      amount *= 1000000;
    } else if (text.toLowerCase().includes('thousand') || text.toLowerCase().includes('k')) {
      amount *= 1000;
    }
    kpis.askAmount = amount;
  }

  // Revenue
  const revenueMatch = text.match(/revenue[:\s]*\$?([\d.,]+)\s*(?:million|M|k|thousand)?/i);
  if (revenueMatch) {
    let revenue = parseFloat(revenueMatch[1].replace(/,/g, ''));
    if (text.toLowerCase().includes('million') || text.toLowerCase().includes('M')) {
      revenue *= 1000000;
    }
    kpis.revenue = revenue;
  }

  // Growth rate
  const growthMatch = text.match(/growth[:\s]*([\d.]+)%/i);
  if (growthMatch) {
    kpis.growthRate = parseFloat(growthMatch[1]);
  }

  // Team size
  const teamMatch = text.match(/(?:team|employees)[:\s]*([\d]+)/i);
  if (teamMatch) {
    kpis.teamSize = parseInt(teamMatch[1]);
  }

  return kpis;
}