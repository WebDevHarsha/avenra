'use client';

import { MarketData } from '../../types';

interface MarketAnalysisProps {
  marketData: MarketData;
}

export default function MarketAnalysis({ marketData }: MarketAnalysisProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-green-600 bg-green-100';
      case 'Negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return '📈';
      case 'Negative':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="space-y-8">
      {/* Market Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          🌍 Market Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {marketData.sector || 'General'}
            </div>
            <p className="text-sm text-gray-600">Market Sector</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className={`text-2xl font-bold mb-1 flex items-center justify-center space-x-2`}>
              <span>{getSentimentIcon(marketData.marketSentiment || 'Neutral')}</span>
              <span className={getSentimentColor(marketData.marketSentiment || 'Neutral').split(' ')[0]}>
                {marketData.marketSentiment || 'Neutral'}
              </span>
            </div>
            <p className="text-sm text-gray-600">Market Sentiment</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {marketData.newsArticles?.length || 0}
            </div>
            <p className="text-sm text-gray-600">News Articles</p>
          </div>
        </div>

        {/* Market Trends */}
        {marketData.trends && marketData.trends.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              🔥 Trending Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {marketData.trends?.map((trend, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  {trend}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* News Analysis */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          📰 Recent Market News
        </h3>

        <div className="space-y-4">
          {marketData.newsArticles && marketData.newsArticles.length > 0 ? (
            marketData.newsArticles?.slice(0, 6)?.map((article, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    {article.relevanceScore && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full ${
                          article.relevanceScore >= 70 ? 'bg-green-100 text-green-800' :
                          article.relevanceScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {article.relevanceScore}% relevant
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Read
                </a>
              </div>
            </div>
          ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">📰</p>
              <p>No recent news articles found for this market.</p>
              <p className="text-sm mt-1">Market analysis is based on general industry trends.</p>
            </div>
          )}
        </div>

        {(marketData.newsArticles?.length || 0) > 6 && (
          <div className="text-center mt-6">
            <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
              View {(marketData.newsArticles?.length || 6) - 6} more articles
            </button>
          </div>
        )}
      </div>

      {/* Market Insights Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📊 Key Market Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Market Dynamics</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Current market sentiment is <strong>{(marketData.marketSentiment || 'neutral').toLowerCase()}</strong> based on recent news analysis
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {marketData.newsArticles?.length || 0} relevant news articles found in the past week
              </li>
              {marketData.trends && marketData.trends.length > 0 && (
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Key trending topics include {marketData.trends?.slice(0, 3)?.join(', ') || 'N/A'}
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Analysis Summary</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Market data collected on {marketData.fetchedAt ? new Date(marketData.fetchedAt).toLocaleDateString() : 'Unknown date'}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Focus sector: <strong>{marketData.sector || 'General market'}</strong>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                News relevance filtering applied for targeted insights
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}