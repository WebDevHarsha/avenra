'use client';

import { formatPercentage, getRiskColor, getScoreColor } from '../../lib/utils';
import { AIAnalysis } from '../../types';

interface AIInsightsProps {
  analysis: AIAnalysis;
}

export default function AIInsights({ analysis }: AIInsightsProps) {
  const { growthPotential, riskAssessment, recommendations } = analysis;

  return (
    <div className="space-y-8">
      {/* Growth Potential Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            🚀 Growth Potential
          </h3>
          <div className={`text-3xl font-bold ${getScoreColor(growthPotential.score)}`}>
            {growthPotential.score}/100
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Projections */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Growth Projections</h4>
            <div className="space-y-3">
              {[
                { label: 'Year 1', value: growthPotential.projectedGrowth.year1, color: 'bg-green-100' },
                { label: 'Year 3', value: growthPotential.projectedGrowth.year3, color: 'bg-blue-100' },
                { label: 'Year 5', value: growthPotential.projectedGrowth.year5, color: 'bg-purple-100' }
              ].map((projection) => (
                <div key={projection.label} className={`p-4 rounded-lg ${projection.color}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{projection.label}</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPercentage(projection.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Factors & Drivers */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Factors</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Growth Factors</p>
                <div className="flex flex-wrap gap-2">
                  {growthPotential.factors.map((factor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Key Drivers</p>
                <div className="flex flex-wrap gap-2">
                  {growthPotential.keyDrivers.map((driver, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            ⚠️ Risk Assessment
          </h3>
          <div className={`text-3xl font-bold ${getRiskColor(riskAssessment.riskScore)}`}>
            {riskAssessment.overallRisk}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Factors */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Risk Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(riskAssessment.riskFactors).map(([category, score]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700 capitalize">
                    {category} Risk
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 70 ? 'bg-red-500' :
                          score >= 40 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags & Mitigation */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Risk Management</h4>
            <div className="space-y-4">
              {riskAssessment.redFlags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">🚩 Red Flags</p>
                  <ul className="space-y-1">
                    {riskAssessment.redFlags.map((flag, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {riskAssessment.mitigationStrategies.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">✅ Mitigation Strategies</p>
                  <ul className="space-y-1">
                    {riskAssessment.mitigationStrategies.map((strategy, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            💡 AI Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-l-4 ${
                  rec.priority === 'High' ? 'border-red-500 bg-red-50' :
                  rec.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{rec.title}</h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  {rec.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-20">Impact:</span>
                    <span className="text-gray-800">{rec.expectedImpact}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-20">Timeline:</span>
                    <span className="text-gray-800">{rec.timeline}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-20">Type:</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                      {rec.type.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}