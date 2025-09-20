'use client';

import { formatCurrency, formatPercentage } from '../../lib/utils';
import { CompanyKPIs } from '../../types';

interface KPIDashboardProps {
  kpis: CompanyKPIs;
  className?: string;
}

export default function KPIDashboard({ kpis, className = '' }: KPIDashboardProps) {
  const kpiCards = [
    {
      label: 'Company',
      value: kpis.companyName || 'N/A',
      icon: '🏢',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      label: 'Sector',
      value: kpis.sector || 'N/A',
      icon: '🎯',
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Stage',
      value: kpis.stage || 'N/A',
      icon: '📊',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      label: 'Funding Round',
      value: kpis.fundingRound || 'N/A',
      icon: '💰',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      label: 'Ask Amount',
      value: kpis.askAmount ? formatCurrency(kpis.askAmount) : 'N/A',
      icon: '💸',
      color: 'bg-red-50 border-red-200'
    },
    {
      label: 'Valuation',
      value: kpis.valuation ? formatCurrency(kpis.valuation) : 'N/A',
      icon: '💎',
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      label: 'Revenue',
      value: kpis.revenue ? formatCurrency(kpis.revenue) : 'N/A',
      icon: '📈',
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Growth Rate',
      value: kpis.growthRate ? formatPercentage(kpis.growthRate) : 'N/A',
      icon: '🚀',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      label: 'Team Size',
      value: kpis.teamSize?.toString() || 'N/A',
      icon: '👥',
      color: 'bg-pink-50 border-pink-200'
    },
    {
      label: 'Market Size',
      value: kpis.marketSize ? formatCurrency(kpis.marketSize) : 'N/A',
      icon: '🌍',
      color: 'bg-teal-50 border-teal-200'
    },
    {
      label: 'Customer Count',
      value: kpis.customerCount?.toLocaleString() || 'N/A',
      icon: '👤',
      color: 'bg-cyan-50 border-cyan-200'
    },
    {
      label: 'Monthly Burn Rate',
      value: kpis.burnRate ? formatCurrency(kpis.burnRate) : 'N/A',
      icon: '🔥',
      color: 'bg-rose-50 border-rose-200'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Company KPIs Overview
        </h3>
        <p className="text-gray-600">
          Key metrics extracted from the pitch deck
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${kpi.color} transition-all duration-200 hover:shadow-md hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {kpi.label}
                </p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {kpis.businessModel && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Business Model
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {kpis.businessModel}
          </p>
        </div>
      )}

      {kpis.keyMetrics && Object.keys(kpis.keyMetrics).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Key Metrics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(kpis.keyMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="font-semibold text-gray-900">
                  {typeof value === 'number' ? formatCurrency(value) : value?.toString() || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}