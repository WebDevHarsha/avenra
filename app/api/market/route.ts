import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '../../../lib/gemini';
import type {  NewsArticle } from '../../../types';

export async function POST(request: NextRequest) {
  try {
  const { companyName, sector: _sector, keywords: _keywords, country = 'us' } = await request.json();

    if (!process.env.NEWS_API) {
      return NextResponse.json(
        { error: 'News API key not configured' },
        { status: 500 }
      );
    }

    // Build search query - prioritize company name if provided
    let searchQuery = '';
    if (companyName) {
      // Use Gemini to optimize the search query for news APIs
  const optimizationPrompt = `
Given this company name: "${companyName}"
And this sector: "${_sector || 'not specified'}"

Create an optimized search query for NewsAPI that will find relevant recent news articles SPECIFICALLY about this company. 

Rules:
1. Extract the main company brand name (e.g., "Airbnb (originally AirBed&Breakfast)" should become "Airbnb")
2. Remove parentheses, extra descriptions, and complex text
3. Add relevant business terms to make it more specific (like "earnings" OR "revenue" OR "announces" OR "reports")
4. Focus on news that would be ABOUT the company, not just mentioning it
5. Format: "CompanyName AND (business term OR business term OR business term)"
6. Return ONLY the optimized search query, nothing else

Example: "Tesla AND (earnings OR revenue OR stock OR announces OR reports OR quarterly)"

Optimized search query:`;

      try {
        const optimizedQuery = await analyzeWithGemini(optimizationPrompt, false);
        searchQuery = optimizedQuery.trim().replace(/['"]/g, ''); // Remove quotes if present
        console.log('Original company name:', companyName);
        console.log('Optimized search query:', searchQuery);
      } catch (error) {
        console.warn('Failed to optimize search query with Gemini, using fallback'+error);
        // Fallback: extract first word before parentheses
        searchQuery = companyName.split('(')[0].trim();
      }
    } else {
      // Fallback to original logic if no company name provided
      if (_sector) searchQuery += _sector;
      if (_keywords && _keywords.length > 0) {
        if (searchQuery) searchQuery += ' AND ';
        searchQuery += _keywords.join(' OR ');
      }
      if (!searchQuery) searchQuery = 'startup OR investment OR funding OR venture capital';
    }
    // Get news from NewsAPI - search for last 20 days
    const fromDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&from=${fromDate}&sortBy=popularity&apiKey=${process.env.NEWS_API}`;
    
    console.log('News API URL:', newsUrl.replace(process.env.NEWS_API || '', 'API_KEY_HIDDEN'));
    console.log('Search query:', searchQuery);
    console.log('From date:', fromDate);
    
    const newsResponse = await fetch(newsUrl);
    const newsData = await newsResponse.json();
    
    console.log('NewsAPI response status:', newsResponse.status);
    // console.log('NewsAPI total results:', newsData.totalResults);
    if (Array.isArray(newsData.articles)) {
      console.log('First few article titles:', (newsData.articles as NewsArticle[]).slice(0, 3).map((a) => a.title));
    }

    if (!newsResponse.ok || newsData.status === 'error') {
      console.warn('News API error:', newsData.message || 'Unknown error');
      return NextResponse.json({ 
        success: true, 
        data: {
          newsArticles: [],
          headlines: [],
          marketData: {
            totalResults: 0,
            searchQuery,
            companyName,
            sector: _sector || 'General',
            lastUpdated: new Date().toISOString()
          }
        }
      });
    }

    // Get top headlines for market sentiment
    const headlinesUrl = `https://newsapi.org/v2/top-headlines?category=business&country=${country}&pageSize=5&apiKey=${process.env.NEWS_API}`;
    const headlinesResponse = await fetch(headlinesUrl);
    const headlinesData = await headlinesResponse.json();

    // Process articles and calculate relevance
    const processedArticles = ((newsData.articles as NewsArticle[]) || []).map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: typeof article.source === 'string' ? article.source : (article.source?.name ?? ''),
      relevanceScore: calculateRelevanceScore(article, companyName),
    }));

    // Filter and sort by relevance score - only keep highly relevant articles
  const filteredArticles = processedArticles.filter((article) => (article.relevanceScore ?? 0) >= 40);
  filteredArticles.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

  console.log('Processed articles count:', processedArticles.length);
  console.log('Filtered articles count:', filteredArticles.length);
  console.log('Top article scores:', filteredArticles.slice(0, 5).map((a) => ({ title: a.title.slice(0, 50) + '...', score: a.relevanceScore })));

    // Analyze market sentiment from headlines and relevant company articles
    const marketSentiment = analyzeMarketSentiment([
      ...(filteredArticles.slice(0, 10) || []), // Prioritize company-specific articles
      ...(headlinesData.articles || [])
    ]);

    // Extract market trends
  const marketTrends = extractMarketTrends(filteredArticles);

    const result = {
      success: true,
      data: {
        newsArticles: filteredArticles,
        headlines: headlinesData.articles || [],
        marketSentiment,
        marketTrends,
        companyName,
        sector: _sector,
        fetchedAt: new Date().toISOString(),
        totalResults: newsData.totalResults || 0,
      },
    };

    // Print result to console
    console.log('✅ Market Data Result:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data', details: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

function calculateRelevanceScore(article: NewsArticle | { title?: string; description?: string }, companyName?: string): number {
  let score = 0;
  const title = (article.title ?? '').toLowerCase();
  const description = (article.description ?? '').toLowerCase();
  const content = `${title} ${description}`;

  if (!companyName) return 0;

  const cleanCompanyName = companyName.split('(')[0].trim().toLowerCase();
  const companyWords = cleanCompanyName.split(' ').filter(word => word.length > 2);
  
  // Very strict scoring - require company name to be prominently mentioned
  let companyMentions = 0;
  let titleMention = false;
  
  companyWords.forEach(word => {
    if (title.includes(word)) {
      score += 40;
      titleMention = true;
      companyMentions++;
    } else if (description.includes(word)) {
      score += 20;
      companyMentions++;
    }
  });

  // Require at least the main company word to be mentioned
  if (companyMentions === 0) return 0;

  // Bonus for title mention - articles about the company should mention it in title
  if (titleMention) score += 30;

  // Bonus for multiple company word matches (for multi-word company names)
  if (companyWords.length > 1 && companyMentions >= companyWords.length) {
    score += 20;
  }

  // Business context bonus (but only if company is already mentioned)
  const businessTerms = ['earnings', 'revenue', 'profit', 'quarterly', 'stock', 'shares', 'ceo', 'announces', 'reports', 'financial'];
  let businessContext = 0;
  businessTerms.forEach(term => {
    if (content.includes(term)) businessContext += 5;
  });
  score += Math.min(businessContext, 25);

  // Penalty for very generic mentions
  const genericTerms = ['like', 'similar to', 'such as', 'including', 'among others'];
  genericTerms.forEach(term => {
    if (content.includes(term + ' ' + cleanCompanyName) || content.includes(cleanCompanyName + ' and')) {
      score -= 20;
    }
  });

  return Math.max(0, Math.min(score, 100));
}

function analyzeMarketSentiment(articles: Array<NewsArticle | { title?: string; description?: string }>): 'Positive' | 'Neutral' | 'Negative' {
  const positiveWords = ['growth', 'increase', 'rise', 'surge', 'success', 'profit', 'gain', 'boom'];
  const negativeWords = ['decline', 'fall', 'drop', 'loss', 'recession', 'crisis', 'crash', 'downturn'];
  
  let positiveCount = 0;
  let negativeCount = 0;

  articles.forEach(article => {
    const content = `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase();
    positiveWords.forEach(word => { if (content.includes(word)) positiveCount++; });
    negativeWords.forEach(word => { if (content.includes(word)) negativeCount++; });
  });

  if (positiveCount > negativeCount * 1.2) return 'Positive';
  if (negativeCount > positiveCount * 1.2) return 'Negative';
  return 'Neutral';
}

function extractMarketTrends(articles: Array<NewsArticle | { title?: string; description?: string }>): string[] {
  const trendKeywords = [
    'artificial intelligence', 'ai', 'machine learning', 'blockchain', 'cryptocurrency',
    'sustainability', 'green energy', 'electric vehicles', 'remote work', 'digital transformation',
    'fintech', 'healthtech', 'edtech', 'proptech', 'climate tech', 'web3', 'metaverse'
  ];

  const trendCounts: { [key: string]: number } = {};
  
  articles.slice(0, 20).forEach(article => {
    const content = `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase();
    trendKeywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        trendCounts[keyword] = (trendCounts[keyword] || 0) + 1;
      }
    });
  });

  return Object.entries(trendCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([keyword]) => keyword);
}
