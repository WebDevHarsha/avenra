 'use client';

import { useState } from 'react';
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

  if (!user) {
    router.push('/auth');
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analysis Complete
                </h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive AI analysis results for your pitch deck
                </p>
              </div>
              <button
                onClick={handleNewAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Analyze New Deck
              </button>
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
