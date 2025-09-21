'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import FileUpload from './FileUpload';
import LoadingSpinner from './LoadingSpinner';

interface AnalysisResult {
  extractedText: string;
  kpis: any;
  analysis: any;
  marketData: any;
}

interface PitchDeckAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function PitchDeckAnalyzer({ onAnalysisComplete }: PitchDeckAnalyzerProps) {
  const [user, loading] = useAuthState(auth);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string>('');

  const extractKPIs = async (text: string) => {
    try {
      setCurrentStep('Extracting KPIs...');
      const response = await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedText: text }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to extract KPIs');
      }

      return result.data;
    } catch (error) {
      console.error('KPI extraction error (frontend):', error);
      // Fallback KPIs
      return {
        companyName: 'N/A',
        sector: 'Technology',
        fundingStage: 'N/A',
        teamSize: null,
        revenue: null,
        customers: 'N/A',
        marketSize: null,
        competition: 'N/A',
        businessModel: 'N/A',
        keyMetrics: 'N/A',
        fundingRequest: null,
        useOfFunds: 'N/A',
        traction: 'N/A',
        technology: 'N/A',
        geographicMarket: 'N/A',
        fundingRound: 'N/A',
        askAmount: null,
        valuation: null,
        growthRate: null,
        customerCount: null,
        burnRate: null,
      };
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setError('');
  };

  const processFile = async () => {
    if (!selectedFile || !user) return;

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Extract text
      setCurrentStep('Extracting text from pitch deck...');
      const extractResponse = await extractText(selectedFile);

      if (!extractResponse.success) {
        throw new Error(extractResponse.error || 'Failed to extract text');
      }

      const extractedText = extractResponse.data?.text || '';

      // Step 2: KPIs
      setCurrentStep('Parsing company information with AI...');
      const kpis = await extractKPIs(extractedText);

      // Step 3: Market Data
      setCurrentStep('Fetching market data...');
      const marketData = await fetchMarketData(kpis.sector, kpis.companyName);

      // Step 4: AI Analysis
      setCurrentStep('Running AI analysis...');
      const analysisResponse = await runAIAnalysis(extractedText, kpis, marketData);

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Failed to complete AI analysis');
      }

      // Final Result
      const result: AnalysisResult = {
        extractedText,
        kpis,
        analysis: analysisResponse.data,
        marketData,
      };

      onAnalysisComplete(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const extractText = async (file: File): Promise<{ success: boolean; data?: { text: string; metadata?: any }; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);

          if (!(window as any).pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
            script.onload = async () => {
              await processPDF(typedArray, resolve);
            };
            script.onerror = () => {
              resolve({ success: false, error: 'Failed to load PDF.js' });
            };
            document.body.appendChild(script);
          } else {
            await processPDF(typedArray, resolve);
          }
        } catch (error) {
          resolve({ success: false, error: 'Failed to extract PDF text' });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
      reader.readAsArrayBuffer(file);
    });
  };

  const processPDF = async (typedArray: Uint8Array, resolve: (value: any) => void) => {
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((s: any) => s.str).join(' ');
        fullText += pageText + '\n';
      }

      resolve({ success: true, data: { text: fullText.trim(), metadata: { pages: pdf.numPages } } });
    } catch (error) {
      resolve({ success: false, error: 'Failed to process PDF' });
    }
  };

  const fetchMarketData = async (sector?: string, companyName?: string) => {
    const keywords = [sector, companyName].filter(Boolean);
    const response = await fetch('/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sector, keywords, pageSize: 15 }),
    });

    if (!response.ok) return null;
    const result = await response.json();
    return result.success ? result.data : null;
  };

  const runAIAnalysis = async (extractedText: string, companyData: any, marketData: any) => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extractedText, companyData, marketData }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'AI analysis failed' };
    }
    return result;
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <div className="text-center p-8"><p className="text-gray-600">Please sign in to analyze pitch decks.</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Pitch Deck Analyzer</h2>
        <p className="text-gray-600">Upload your pitch deck to get insights, KPIs, risk assessment, and market analysis</p>
      </div>

      <div className="space-y-6">
        <FileUpload onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} selectedFile={selectedFile} isUploading={isProcessing} />

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>}

        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <LoadingSpinner size="sm" />
            <p className="ml-3 text-sm text-blue-800">{currentStep}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={processFile}
            disabled={!selectedFile || isProcessing}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedFile && !isProcessing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Pitch Deck'}
          </button>
        </div>
      </div>
    </div>
  );
}
