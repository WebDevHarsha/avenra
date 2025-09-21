 'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import PitchDeckAnalyzer from '../components/PitchDeckAnalyzer';
import Dashboard from '../components/Dashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { CompanyKPIs, AIAnalysis, MarketData } from '@/types';

export default function AnalyzePage() {
  const [user, loading] = useAuthState(auth);
  const [analysisResult, setAnalysisResult] = useState<{
    kpis?: Partial<CompanyKPIs> | null;
    analysis?: Partial<AIAnalysis> | null;
    marketData?: Partial<MarketData> | null;
    extractedText?: string | null;
  } | null>(null);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [loading, user, router]);

  if (!user) {
    return null;
  }

  const handleAnalysisComplete = (result: {
    kpis?: Partial<CompanyKPIs> | null;
    analysis?: Partial<AIAnalysis> | null;
    marketData?: Partial<MarketData> | null;
    extractedText?: string | null;
  }) => {
    setAnalysisResult(result);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <div>
            
            
            <PitchDeckAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  Analysis Complete
                </h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  Comprehensive AI analysis results for your pitch deck
                </p>
              </div>

              <div className="flex w-full md:w-auto flex-col sm:flex-row gap-3">
                <button
                  onClick={handleNewAnalysis}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Analyze New Deck
                </button>

                <button
                  onClick={() => router.push('/simulation')}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Start Simulation
                </button>
              </div>
            </div>

            <Dashboard
              kpis={analysisResult.kpis ?? undefined}
              analysis={analysisResult.analysis ?? undefined}
              marketData={analysisResult.marketData ?? undefined}
              extractedText={analysisResult.extractedText ?? undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function setIsAnalyzing(arg0: boolean) {
  throw new Error('Function not implemented.');
}
