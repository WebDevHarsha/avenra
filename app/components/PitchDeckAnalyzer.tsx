'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import FileUpload from './FileUpload';
import LoadingSpinner from './LoadingSpinner';
import { parseKPIs } from '../../lib/utils';

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
      // Step 1: Extract text from file (no storage needed)
      setCurrentStep('Extracting text from pitch deck...');
      console.log('Starting text extraction for file:', { 
        name: selectedFile.name, 
        size: selectedFile.size, 
        type: selectedFile.type 
      });
      
      const extractResponse = await extractText(selectedFile);
      
      if (!extractResponse.success) {
        throw new Error(extractResponse.error || 'Failed to extract text');
      }

      const extractedText = extractResponse.data?.text || '';

      // Step 2: Parse KPIs from extracted text
      setCurrentStep('Parsing company information...');
      const kpis = parseKPIs(extractedText);

      // Step 3: Fetch market data
      setCurrentStep('Fetching market data...');
      const marketData = await fetchMarketData(kpis.sector, kpis.companyName);

      // Step 4: Run AI analysis
      setCurrentStep('Running AI analysis...');
      const analysisResponse = await runAIAnalysis(extractedText, kpis, marketData);
      
      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Failed to complete AI analysis');
      }

      // Complete analysis
      const result: AnalysisResult = {
        extractedText,
        kpis,
        analysis: analysisResponse.data,
        marketData
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
      console.log('Starting client-side PDF extraction...');
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);

          // Check if PDF.js is already loaded
          if (!(window as any).pdfjsLib) {
            // Dynamically load pdf.js script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
            
            script.onload = async () => {
              await processPDF(typedArray, resolve);
            };
            
            script.onerror = () => {
              resolve({
                success: false,
                error: 'Failed to load PDF.js library'
              });
            };
            
            document.body.appendChild(script);
          } else {
            await processPDF(typedArray, resolve);
          }
        } catch (error) {
          console.error('PDF extraction error:', error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to extract PDF text'
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const processPDF = async (typedArray: Uint8Array, resolve: (value: any) => void) => {
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

      console.log('Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      
      console.log(`PDF loaded. Pages: ${pdf.numPages}`);
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((s: any) => s.str).join(' ');
        fullText += pageText + '\n';
      }

      console.log(`Extraction complete. Text length: ${fullText.length}`);
      
      resolve({
        success: true,
        data: {
          text: fullText.trim(),
          metadata: {
            pages: pdf.numPages,
            extractionMethod: 'client-side-pdfjs'
          }
        }
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process PDF'
      });
    }
  };

  const fetchMarketData = async (sector?: string, companyName?: string) => {
    const keywords = [sector, companyName].filter(Boolean);
    
    const response = await fetch('/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sector, 
        keywords,
        pageSize: 15 
      }),
    });

    if (!response.ok) {
      console.warn('Market data fetch failed, continuing without market context');
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  };

  const runAIAnalysis = async (extractedText: string, companyData: any, marketData: any) => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extractedText,
        companyData,
        marketData,
      }),
    });

    const result = await response.json();
    
    // If the response status is not ok, treat it as an error
    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.details || 'Failed to complete AI analysis'
      };
    }
    
    return result;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Please sign in to analyze pitch decks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Pitch Deck Analyzer
        </h2>
        <p className="text-gray-600">
          Upload your pitch deck to get comprehensive AI insights, risk assessment, and market analysis
        </p>
      </div>

      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          selectedFile={selectedFile}
          isUploading={isProcessing}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <div className="ml-3">
                <p className="text-sm text-blue-800 font-medium">Processing...</p>
                {currentStep && (
                  <p className="text-xs text-blue-600 mt-1">{currentStep}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={processFile}
            disabled={!selectedFile || isProcessing}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-200
              ${selectedFile && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Pitch Deck'}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>The analysis includes:</p>
          <ul className="mt-2 space-y-1">
            <li>• KPI extraction and parsing</li>
            <li>• AI-powered growth potential assessment</li>
            <li>• Risk analysis and red flags identification</li>
            <li>• Market trends and competitive analysis</li>
            <li>• Investment recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}