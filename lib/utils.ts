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
      model: "gemini-1.5-flash",
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