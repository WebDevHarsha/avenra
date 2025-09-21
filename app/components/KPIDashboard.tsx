'use client';

import { formatCurrency, formatPercentage } from '../../lib/utils';
import { CompanyKPIs } from '../../types';

interface KPIDashboardProps {
  kpis: CompanyKPIs;
  className?: string;
}

export default function KPIDashboard({ kpis, className = '' }: KPIDashboardProps) {
  // Helper function to safely get values and handle missing fields
  const getValue = (value: unknown) => {
    if (value === undefined || value === null || value === '') return 'N/A';
    return typeof value === 'string' ? value : JSON.stringify(value);
  };

  const kpiCards = [
  { label: 'Company', value: getValue(kpis.companyName), icon: '🏢', color: 'bg-blue-50 border-blue-200' },
  { label: 'Sector', value: getValue(kpis.sector), icon: '🎯', color: 'bg-green-50 border-green-200' },
  { label: 'Stage', value: getValue(kpis.fundingStage), icon: '📊', color: 'bg-purple-50 border-purple-200' },
  { label: 'Team Size', value: getValue(kpis.teamSize), icon: '👥', color: 'bg-pink-50 border-pink-200' },
  { label: 'Revenue', value: getValue(kpis.revenue), icon: '📈', color: 'bg-emerald-50 border-emerald-200' },
  { label: 'Customers', value: getValue(((kpis as Partial<import('../../types').CompanyKPIs>).customers) || kpis.customerCount), icon: '👤', color: 'bg-cyan-50 border-cyan-200' },
  { label: 'Market Size', value: getValue(kpis.marketSize), icon: '🌍', color: 'bg-teal-50 border-teal-200' },
  { label: 'Competition', value: getValue(kpis.competition), icon: '⚔️', color: 'bg-lime-50 border-lime-200' },
  { label: 'Geographic Market', value: getValue(kpis.geographicMarket), icon: '🗺️', color: 'bg-fuchsia-50 border-fuchsia-200' },
  { label: 'Funding Request', value: getValue(kpis.fundingRequest), icon: '💰', color: 'bg-yellow-50 border-yellow-200' },
  { label: 'Use of Funds', value: getValue(kpis.useOfFunds), icon: '💸', color: 'bg-red-50 border-red-200' },
  { label: 'Technology', value: getValue(kpis.technology), icon: '🛠️', color: 'bg-indigo-50 border-indigo-200' },
];


  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Company KPIs Overview</h3>
        <p className="text-gray-600">Key metrics extracted from the pitch deck</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${kpi.color} transition-all duration-200 hover:shadow-md hover:scale-105`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{kpi.label}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {typeof kpi.value === 'string' ? kpi.value : JSON.stringify(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="space-y-4">
        {kpis.businessModel && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">💼</span> Business Model
            </h4>
            <p className="text-gray-700 leading-relaxed">{kpis.businessModel}</p>
          </div>
        )}

        {kpis.keyMetrics && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📊</span> Key Metrics
            </h4>
            <p className="text-gray-700 leading-relaxed">{kpis.keyMetrics}</p>
          </div>
        )}

        {kpis.traction && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🚀</span> Traction
            </h4>
            <p className="text-gray-700 leading-relaxed">{kpis.traction}</p>
          </div>
        )}
      </div>
    </div>
  );
}
