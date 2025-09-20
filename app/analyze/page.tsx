'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import PitchDeckAnalyzer from '../components/PitchDeckAnalyzer';
import Dashboard from '../components/Dashboard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AnalyzePage() {
  const [user, loading] = useAuthState(auth);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
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
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI Pitch Deck Analyzer
              </h1>
              <p className="text-xl text-gray-600">
                Upload your pitch deck to get comprehensive AI-powered analysis and insights
              </p>
            </div>
            
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
              kpis={analysisResult.kpis}
              analysis={analysisResult.analysis}
              marketData={analysisResult.marketData}
              extractedText={analysisResult.extractedText}
            />
          </div>
        )}
      </div>
    </div>
  );
}