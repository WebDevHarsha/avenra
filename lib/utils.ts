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

// Parse KPIs using Gemini AI with grounding/web search
export async function parseKPIs(text: string): Promise<Partial<import('../types').CompanyKPIs>> {
  try {
    console.log('Using Gemini AI with grounding to extract KPIs...');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use Gemini model with grounding capabilities
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      tools: [{
        googleSearchRetrieval: {}
      }]
    });

    const prompt = `
Analyze this pitch deck content and extract key company KPIs. Use web search to verify and enhance the information with current market data and company information if the company exists.

PITCH DECK CONTENT:
${text}

Please extract and research the following KPIs. Use web search to find additional information about the company if it exists:

1. Company Name - exact name of the company
2. Sector/Industry - specific industry or market segment
3. Funding Round - current or target funding stage (Seed, Series A, B, etc.)
4. Ask Amount - funding amount being sought (in USD)
5. Revenue - current annual revenue (in USD)
6. Growth Rate - revenue growth rate percentage
7. Team Size - number of employees
8. Market Size - Total Addressable Market (TAM) in USD
9. Customer Count - number of customers/users
10. Burn Rate - monthly cash burn (in USD)

Return the response in this exact JSON format (use null for unavailable data):
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

If you find the company online, incorporate current/verified information. Provide only the JSON response.
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