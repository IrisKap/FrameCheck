import { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'
import PhotographerSimilarity from './PhotographerSimilarity'
import CropSuggestion from './CropSuggestion'
import Features from './Features'
import About from './About'
import { trackPageView, trackNavigation } from './analytics'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [currentPage, setCurrentPage] = useState('home');

  // Track page views
  useEffect(() => {
    trackPageView(currentPage === 'home' ? 'Home' : currentPage);
  }, [currentPage]);

  const handleTabChange = (tab) => {
    const previousTab = activeTab; // Track previous tab for analytics
    setActiveTab(tab);
    trackNavigation(previousTab, tab); // Track navigation
    setTimeout(() => {
      document.getElementById('tools-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleNavigateToTool = (tool) => {
    if (tool === 'home') {
      setCurrentPage('home');
      setActiveTab('analysis');
    } else {
      setCurrentPage('home');
      setActiveTab(tool);
      setTimeout(() => {
        document.getElementById('tools-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  const handleFeaturesClick = () => {
    trackNavigation(currentPage, 'features'); // Track navigation
    setCurrentPage('features');
  };

  const handleAboutClick = () => { // New handler for About button
    trackNavigation(currentPage, 'about'); // Track navigation
    setCurrentPage('about');
  };

  // Conditional rendering for Features page
  if (currentPage === 'features') {
    return <Features onNavigateToTool={handleNavigateToTool} />;
  }

  // Conditional rendering for About page
  if (currentPage === 'about') {
    return <About onNavigateToTool={handleNavigateToTool} />;
  }

  // Render Home page
  return (
    <div className="min-h-screen relative hero-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen">
        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center px-8 py-6">
          <div className="flex items-center">
            {/* Unified Logo Box */}
            <div 
              onClick={() => setCurrentPage('home')}
              className="bg-black/20 backdrop-blur-md rounded-lg flex items-center px-4 py-3 shadow-lg space-x-3 border border-white/20 cursor-pointer hover:bg-black/30 transition-colors"
            >
              <div className="w-6 h-6 border-2 rounded-sm flex items-center justify-center border-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-black text-2xl serif-font text-white">FrameCheck</span>
            </div>
          </div>
          <div className="hidden md:flex space-x-10">
            <span 
              onClick={handleFeaturesClick}
              className="hover:opacity-70 transition-colors font-medium text-xl text-white cursor-pointer sans-font"
            >
              Features
            </span>
            <span 
              onClick={handleAboutClick}
              className="hover:opacity-70 transition-colors font-medium text-xl text-white cursor-pointer sans-font"
            >
              About
            </span>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Text Content */}
              <div className="text-left">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8 serif-font text-white drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
                  Perfect your photography composition
                </h1>
                <p className="text-xl text-white/90 mb-12 leading-relaxed drop-shadow-md sans-font" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                  Get your free AI-powered analysis today.<br />
                  No account required.
                </p>
              </div>

              {/* Right Column - Mockup Element */}
              <div className="flex justify-center">
                <div className="mockup-container w-full max-w-lg aspect-[4/3] p-6">
                  {/* Mockup Image Placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg relative overflow-hidden">
                    {/* Sample photo background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 opacity-60"></div>
                    
                    {/* Rule of Thirds Grid Overlay */}
                    <div className="rule-of-thirds-grid">
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/80"></div>
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-white/80"></div>
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/80"></div>
                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/80"></div>
                    </div>

                    {/* Leading Lines */}
                    <div className="leading-line" style={{
                      top: '60%',
                      left: '20%',
                      width: '40%',
                      transform: 'rotate(-15deg)'
                    }}></div>
                    <div className="leading-line" style={{
                      top: '30%',
                      left: '10%',
                      width: '30%',
                      transform: 'rotate(25deg)'
                    }}></div>
                    <div className="leading-line" style={{
                      top: '70%',
                      left: '50%',
                      width: '35%',
                      transform: 'rotate(-5deg)'
                    }}></div>

                    {/* FrameCheck UI Elements */}
                    <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm sans-font">
                      FrameCheck Analysis
                    </div>
                    <div className="absolute bottom-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded text-sm sans-font">
                      ✓ Composition Score: 85%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto mt-20">
            {/* Composition Analysis Card */}
            <div className="feature-card bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10" style={{transform: 'translateY(0px)'}}>
              <div className="text-6xl mb-6 text-center">📐</div>
              <h3 className="text-3xl font-bold mb-4 text-center text-white serif-font">Composition Analysis</h3>
              <p className="text-gray-300 mb-8 text-center leading-relaxed sans-font">Analyze rule of thirds, leading lines, and get AI-powered feedback on your photography composition.</p>
              <button
                onClick={() => handleTabChange('analysis')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-blue-400/20 sans-font"
              >
                📐 Analyze Composition
              </button>
            </div>

            {/* Style Similarity Card */}
            <div className="feature-card bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10" style={{transform: 'translateY(20px)'}}>
              <div className="text-6xl mb-6 text-center">🎨</div>
              <h3 className="text-3xl font-bold mb-4 text-center text-white serif-font">Style Similarity</h3>
              <p className="text-gray-300 mb-8 text-center leading-relaxed sans-font">Discover which famous photographers share your visual style. Upload up to 4 images for analysis.</p>
              <button
                onClick={() => handleTabChange('similarity')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-8 py-4 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-pink-400/20 sans-font"
              >
                🎨 Find Similar Style
              </button>
            </div>

            {/* Crop Suggestion Card */}
            <div className="feature-card bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10" style={{transform: 'translateY(10px)'}}>
              <div className="text-6xl mb-6 text-center">✂️</div>
              <h3 className="text-3xl font-bold mb-4 text-center text-white serif-font">Smart Crop Suggestion</h3>
              <p className="text-gray-300 mb-8 text-center leading-relaxed sans-font">Get AI-powered crop suggestions based on Rule of Thirds and subject detection for optimal composition.</p>
              <button
                onClick={() => handleTabChange('crop')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-emerald-400/20 sans-font"
              >
                ✂️ Suggest Crop
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-16">
            <div className="animate-bounce">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div id="tools-section" className="bg-gray-900 py-16">
        <div className="container mx-auto px-8">
          {/* Tab Content */}
          {activeTab === 'analysis' && <ImageUploader />}
          {activeTab === 'similarity' && <PhotographerSimilarity />}
          {activeTab === 'crop' && <CropSuggestion />}
        </div>
      </div>
    </div>
  )
}

export default App