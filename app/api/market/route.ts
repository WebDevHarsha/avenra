import { NextRequest, NextResponse } from 'next/server';
const NewsAPI = require('newsapi');

const newsapi = new NewsAPI(process.env.NEWS_API);

export async function POST(request: NextRequest) {
  try {
    const { sector, keywords, country = 'us', pageSize = 10 } = await request.json();

    if (!process.env.NEWS_API) {
      return NextResponse.json(
        { error: 'News API key not configured' },
        { status: 500 }
      );
    }

    // Build search query
    let searchQuery = '';
    if (sector) {
      searchQuery += sector;
    }
    if (keywords && keywords.length > 0) {
      if (searchQuery) searchQuery += ' AND ';
      searchQuery += keywords.join(' OR ');
    }

    // If no specific search terms, use general business/startup terms
    if (!searchQuery) {
      searchQuery = 'startup OR investment OR funding OR venture capital';
    }

    // Get current news using direct API call
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&from=${fromDate}&apiKey=${process.env.NEWS_API}`;
    
    const newsResponse = await fetch(newsUrl);
    const newsData = await newsResponse.json();

    if (!newsResponse.ok || newsData.status === 'error') {
      console.warn('News API error:', newsData.message || 'Unknown error');
      // Return fallback data if News API fails
      return NextResponse.json({ 
        success: true, 
        data: {
          articles: [],
          news: [],
          marketData: {
            totalResults: 0,
            searchQuery,
            sector: sector || 'General',
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
    const processedArticles = newsData.articles?.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
      relevanceScore: calculateRelevanceScore(article, sector, keywords),
    }));

    // Sort by relevance score
    processedArticles.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

    // Analyze market sentiment from headlines
    const marketSentiment = analyzeMarketSentiment([
      ...(headlinesData.articles || []),
      ...(newsData.articles?.slice(0, 10) || [])
    ]);

    // Extract market trends from articles
    const marketTrends = extractMarketTrends(processedArticles, sector);

    return NextResponse.json({
      success: true,
      data: {
        articles: processedArticles,
        headlines: headlinesData.articles || [],
        marketSentiment,
        marketTrends,
        sector,
        fetchedAt: new Date().toISOString(),
        totalResults: newsData.totalResults || 0,
      },
    });

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data', details: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

function calculateRelevanceScore(article: any, sector?: string, keywords?: string[]): number {
  let score = 0;
  const content = `${article.title} ${article.description}`.toLowerCase();

  // Sector relevance
  if (sector && content.includes(sector.toLowerCase())) {
    score += 30;
  }

  // Keywords relevance
  if (keywords) {
    keywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        score += 20;
      }
    });
  }

  // Business/investment terms
  const businessTerms = ['funding', 'investment', 'startup', 'venture', 'ipo', 'acquisition', 'growth'];
  businessTerms.forEach(term => {
    if (content.includes(term)) {
      score += 10;
    }
  });

  return Math.min(score, 100);
}

function analyzeMarketSentiment(articles: any[]): 'Positive' | 'Neutral' | 'Negative' {
  const positiveWords = ['growth', 'increase', 'rise', 'surge', 'success', 'profit', 'gain', 'boom'];
  const negativeWords = ['decline', 'fall', 'drop', 'loss', 'recession', 'crisis', 'crash', 'downturn'];
  
  let positiveCount = 0;
  let negativeCount = 0;

  articles.forEach(article => {
    const content = `${article.title} ${article.description}`.toLowerCase();
    
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) negativeCount++;
    });
  });

  if (positiveCount > negativeCount * 1.2) return 'Positive';
  if (negativeCount > positiveCount * 1.2) return 'Negative';
  return 'Neutral';
}

function extractMarketTrends(articles: any[], sector?: string): string[] {
  const trendKeywords = [
    'artificial intelligence', 'ai', 'machine learning', 'blockchain', 'cryptocurrency',
    'sustainability', 'green energy', 'electric vehicles', 'remote work', 'digital transformation',
    'fintech', 'healthtech', 'edtech', 'proptech', 'climate tech', 'web3', 'metaverse'
  ];

  const trendCounts: { [key: string]: number } = {};
  
  articles.slice(0, 20).forEach(article => {
    const content = `${article.title} ${article.description}`.toLowerCase();
    
    trendKeywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        trendCounts[keyword] = (trendCounts[keyword] || 0) + 1;
      }
    });
  });

  // Return top trends
  return Object.entries(trendCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([keyword]) => keyword);
}