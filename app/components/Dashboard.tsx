'use client';

import { useState } from 'react';
import KPIDashboard from './KPIDashboard';
import AIInsights from './AIInsights';
import MarketAnalysis from './MarketAnalysis';
import { CompanyKPIs, AIAnalysis, MarketData } from '../../types';

interface DashboardProps {
  kpis: CompanyKPIs;
  analysis?: AIAnalysis;
  marketData?: MarketData;
  extractedText?: string;
}

export default function Dashboard({ kpis, analysis, marketData, extractedText }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'kpis' | 'insights' | 'market'>('kpis');

  const tabs = [
    { id: 'kpis', label: 'KPIs Overview', icon: '📊' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' },
    { id: 'market', label: 'Market Analysis', icon: '📈' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Analysis Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          {kpis.companyName || 'Company'} - Comprehensive Investment Analysis
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'kpis' && (
          <div className="animate-fade-in">
            <KPIDashboard kpis={kpis} />
            
            {extractedText && (
              <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Extracted Content Preview
                </h3>
                <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {extractedText.substring(0, 1000)}
                    {extractedText.length > 1000 && '...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && analysis && (
          <div className="animate-fade-in">
            <AIInsights analysis={analysis} />
          </div>
        )}

        {activeTab === 'market' && marketData && (
          <div className="animate-fade-in">
            <MarketAnalysis marketData={marketData} />
          </div>
        )}

        {activeTab === 'insights' && !analysis && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No AI Analysis Available
            </h3>
            <p className="text-gray-500">
              Run the analysis to see AI-generated insights and recommendations.
            </p>
          </div>
        )}

        {activeTab === 'market' && !marketData && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Market Data Available
            </h3>
            <p className="text-gray-500">
              Market analysis data is not available for this pitch deck.
            </p>
          </div>
        )}
      </div>

      {/* Summary Card at Bottom */}
      {analysis && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Overall Investment Score
          </h3>
          <div className="flex items-center justify-center space-x-8">
            <div>
              <div className="text-4xl font-bold text-blue-600">
                {analysis.overallScore}/100
              </div>
              <p className="text-sm text-gray-600 mt-1">Investment Score</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">
                {analysis.confidence}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Confidence Level</p>
            </div>
            <div>
              <div className={`text-4xl font-bold ${
                analysis.riskAssessment.overallRisk === 'Low' ? 'text-green-600' :
                analysis.riskAssessment.overallRisk === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {analysis.riskAssessment.overallRisk}
              </div>
              <p className="text-sm text-gray-600 mt-1">Risk Level</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}