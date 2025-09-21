'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import Link from 'next/link';
import AuthForm from './components/AuthForm';
import LoadingSpinner from './components/LoadingSpinner';

export default function HomePage() {
  const [user, loading] = useAuthState(auth);
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AuthForm onSuccess={() => setShowAuth(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Powered Market
              <span className="block text-blue-300">Simulator</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Upload your pitch deck and get comprehensive AI analysis, risk assessment, 
              and market insights to make informed investment decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    href="/analyze"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Analyze Pitch Deck
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Analysis Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get comprehensive insights powered by advanced AI and real-time market data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                KPI Extraction
              </h3>
              <p className="text-gray-600">
                Automatically extract and parse key performance indicators, financial metrics, 
                and company data from pitch decks.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI Risk Assessment
              </h3>
              <p className="text-gray-600">
                Get detailed risk analysis with red flags identification and 
                mitigation strategies powered by Gemini AI.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Market Analysis
              </h3>
              <p className="text-gray-600">
                Real-time market trends, news sentiment analysis, and competitive 
                landscape insights for informed decisions.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Growth Projections
              </h3>
              <p className="text-gray-600">
                AI-generated growth potential analysis with 1, 3, and 5-year 
                projections based on market conditions.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Recommendations
              </h3>
              <p className="text-gray-600">
                Actionable investment recommendations with priority levels, 
                timelines, and expected impact analysis.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-200">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Comprehensive Reports
              </h3>
              <p className="text-gray-600">
                Interactive dashboards with charts, visualizations, and 
                detailed reports for presentation to stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple 4-step process to get comprehensive pitch deck analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Upload Pitch Deck',
                description: 'Upload your PDF or image pitch deck files',
                icon: '📄'
              },
              {
                step: 2,
                title: 'AI Text Extraction',
                description: 'Our AI extracts and processes all content from your deck',
                icon: '🔍'
              },
              {
                step: 3,
                title: 'Market & AI Analysis',
                description: 'Real-time market data and AI analysis generate insights',
                icon: '🧠'
              },
              {
                step: 4,
                title: 'Get Results',
                description: 'View comprehensive dashboard with actionable insights',
                icon: '✅'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-blue-900 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Investment Process?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of investors using AI-powered analysis to make smarter decisions
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Free Analysis
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <img src="/avenra.png" alt="Avenra logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-bold">Avenra AI</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-Powered Market Simulator for Smarter Investment Decisions
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Avenra AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
