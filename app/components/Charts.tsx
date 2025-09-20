'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface GrowthProjectionChartProps {
  data: {
    year1: number;
    year3: number;
    year5: number;
  };
}

export function GrowthProjectionChart({ data }: GrowthProjectionChartProps) {
  const chartData = {
    labels: ['Current', 'Year 1', 'Year 3', 'Year 5'],
    datasets: [
      {
        label: 'Projected Growth (%)',
        data: [0, data.year1, data.year3, data.year5],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Growth Projection Timeline',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <Line data={chartData} options={options} />
    </div>
  );
}

interface RiskBreakdownChartProps {
  riskFactors: {
    market: number;
    team: number;
    financial: number;
    competitive: number;
  };
}

export function RiskBreakdownChart({ riskFactors }: RiskBreakdownChartProps) {
  const chartData = {
    labels: ['Market Risk', 'Team Risk', 'Financial Risk', 'Competitive Risk'],
    datasets: [
      {
        label: 'Risk Score',
        data: [riskFactors.market, riskFactors.team, riskFactors.financial, riskFactors.competitive],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Risk Factor Breakdown',
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

interface ScoreComparisonChartProps {
  scores: {
    growth: number;
    overall: number;
    confidence: number;
    riskScore: number;
  };
}

export function ScoreComparisonChart({ scores }: ScoreComparisonChartProps) {
  const chartData = {
    labels: ['Growth Potential', 'Overall Score', 'Confidence', 'Risk Score (inverted)'],
    datasets: [
      {
        label: 'Scores',
        data: [scores.growth, scores.overall, scores.confidence, 100 - scores.riskScore],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Investment Metrics Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <Bar data={chartData} options={options} />
    </div>
  );
}

interface MarketSentimentChartProps {
  articles: Array<{
    publishedAt: string;
    relevanceScore?: number;
  }>;
  marketSentiment: 'Positive' | 'Neutral' | 'Negative';
}

export function MarketSentimentChart({ articles, marketSentiment }: MarketSentimentChartProps) {
  // Process articles by day
  const dayData = articles.reduce((acc, article) => {
    const date = new Date(article.publishedAt).toDateString();
    if (!acc[date]) {
      acc[date] = { count: 0, totalRelevance: 0 };
    }
    acc[date].count += 1;
    acc[date].totalRelevance += article.relevanceScore || 50;
    return acc;
  }, {} as Record<string, { count: number; totalRelevance: number }>);

  const labels = Object.keys(dayData).sort().slice(-7); // Last 7 days
  const articleCounts = labels.map(date => dayData[date]?.count || 0);
  const avgRelevance = labels.map(date => 
    dayData[date] ? dayData[date].totalRelevance / dayData[date].count : 0
  );

  const chartData = {
    labels: labels.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Article Count',
        data: articleCounts,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Avg Relevance',
        data: avgRelevance,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Market News Trends - Sentiment: ${marketSentiment}`,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Article Count'
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Relevance Score'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <Line data={chartData} options={options} />
    </div>
  );
}