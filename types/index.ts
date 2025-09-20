// Environment variables types
export interface EnvConfig {
  NEWS_API: string;
  FIRECRAWLER_API: string;
  GEMINI_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID: string;
}

// Pitch deck data types
export interface PitchDeck {
  id: string;
  userId: string;
  fileName: string;
  uploadedAt: Date;
  fileUrl: string;
  extractedText?: string;
  kpis?: CompanyKPIs;
  analysis?: AIAnalysis;
}

export interface CompanyKPIs {
  companyName: string;
  sector: string;
  stage: string;
  fundingRound?: string;
  askAmount?: number;
  valuation?: number;
  revenue?: number;
  growthRate?: number;
  teamSize?: number;
  marketSize?: number;
  businessModel: string;
  keyMetrics: Record<string, any>;
}

export interface AIAnalysis {
  id: string;
  pitchDeckId: string;
  timestamp: Date;
  growthPotential: GrowthPotential;
  riskAssessment: RiskAssessment;
  marketAnalysis: MarketAnalysis;
  recommendations: Recommendation[];
  overallScore: number;
  confidence: number;
}

export interface GrowthPotential {
  score: number; // 0-100
  factors: string[];
  projectedGrowth: {
    year1: number;
    year3: number;
    year5: number;
  };
  keyDrivers: string[];
}

export interface RiskAssessment {
  overallRisk: 'Low' | 'Medium' | 'High';
  riskScore: number; // 0-100
  redFlags: string[];
  mitigationStrategies: string[];
  riskFactors: {
    market: number;
    team: number;
    financial: number;
    competitive: number;
  };
}

export interface MarketAnalysis {
  marketTrends: string[];
  competitivePosition: string;
  marketSize: number;
  growthRate: number;
  opportunities: string[];
  threats: string[];
}

export interface Recommendation {
  type: 'investment' | 'growth' | 'risk-mitigation' | 'market-strategy';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  expectedImpact: string;
  timeline: string;
}

// News and market data types
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  relevanceScore?: number;
}

export interface MarketData {
  sector: string;
  trends: string[];
  newsArticles: NewsArticle[];
  marketSentiment: 'Positive' | 'Neutral' | 'Negative';
  fetchedAt: Date;
}

// User and session types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface SimulationSession {
  id: string;
  userId: string;
  pitchDeckId: string;
  scenarios: Scenario[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Scenario {
  id: string;
  name: string;
  parameters: {
    marketCondition: 'bull' | 'bear' | 'neutral';
    competitionLevel: 'low' | 'medium' | 'high';
    fundingAvailability: 'abundant' | 'moderate' | 'scarce';
  };
  results: {
    successProbability: number;
    projectedValuation: number;
    timeToExit: number;
    riskAdjustedReturn: number;
  };
}

// API Response types
export interface FireCrawlerResponse {
  success: boolean;
  data: {
    markdown: string;
    html: string;
    metadata: Record<string, any>;
  };
  error?: string;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface GeminiResponse {
  success: boolean;
  data: any;
  error?: string;
}