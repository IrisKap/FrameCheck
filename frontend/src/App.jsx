import { useState } from 'react'
import ImageUploader from './ImageUploader'
import PhotographerSimilarity from './PhotographerSimilarity'
import CropSuggestion from './CropSuggestion'
import Features from './Features'
import About from './About'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [currentPage, setCurrentPage] = useState('home');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Scroll to the tools section
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
      // Scroll to tools section after navigation
      setTimeout(() => {
        document.getElementById('tools-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  const handleFeaturesClick = () => {
    setCurrentPage('features');
  };

  const handleAboutClick = () => {
    setCurrentPage('about');
  };

  // Render Features page
  if (currentPage === 'features') {
    return <Features onNavigateToTool={handleNavigateToTool} />;
  }

  // Render About page
  if (currentPage === 'about') {
    return <About onNavigateToTool={handleNavigateToTool} />;
  }

  // Render Home page
  return (
    <div className="min-h-screen relative" style={{
      background: `
        linear-gradient(135deg, #f0f4f0 0%, #e8f0e8 25%, #d4e6d4 50%, #c4dcc4 75%, #9cb59c 100%),
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(124, 150, 124, 0.03) 2px,
          rgba(124, 150, 124, 0.03) 4px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 2px,
          rgba(108, 140, 108, 0.02) 2px,
          rgba(108, 140, 108, 0.02) 4px
        )
      `
    }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen">
        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center px-8 py-6">
          <div className="flex items-center">
            {/* Unified Logo Box */}
            <div 
              onClick={() => setCurrentPage('home')}
              className="bg-white/95 backdrop-blur-sm rounded-lg flex items-center px-4 py-3 shadow-lg space-x-3 border border-white/20 cursor-pointer hover:bg-white transition-colors"
            >
              <div className="w-6 h-6 border-2 rounded-sm flex items-center justify-center" style={{borderColor: '#2d3748'}}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{color: '#2d3748'}}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-black text-2xl serif-font" style={{color: '#2d3748'}}>FrameCheck</span>
            </div>
          </div>
          <div className="hidden md:flex space-x-10">
            <span 
              onClick={handleFeaturesClick}
              className="hover:opacity-70 transition-colors font-medium text-xl text-black cursor-pointer"
            >
              Features
            </span>
            <span 
              onClick={handleAboutClick}
              className="hover:opacity-70 transition-colors font-medium text-xl text-black cursor-pointer"
            >
              About
            </span>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <h1 className="text-6xl lg:text-8xl font-bold leading-tight mb-8 serif-font text-white drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
              Perfect your photography composition
            </h1>
            <p className="text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto drop-shadow-md" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
              Get your free AI-powered analysis today.<br />
              No account required.
            </p>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto">
              {/* Composition Analysis Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                <div className="text-5xl mb-4 text-center">📐</div>
                <h3 className="text-2xl font-bold mb-3 text-center" style={{color: '#2d3748'}}>Composition Analysis</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed text-sm">Analyze rule of thirds, leading lines, and get AI-powered feedback on your photography composition.</p>
                <button
                  onClick={() => handleTabChange('analysis')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-emerald-500/20"
                >
                  📐 Analyze Composition
                </button>
              </div>

              {/* Style Similarity Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                <div className="text-5xl mb-4 text-center">🎨</div>
                <h3 className="text-2xl font-bold mb-3 text-center" style={{color: '#2d3748'}}>Style Similarity</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed text-sm">Discover which famous photographers share your visual style. Upload up to 4 images for analysis.</p>
                <button
                  onClick={() => handleTabChange('similarity')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-emerald-500/20"
                >
                  🎨 Find Similar Style
                </button>
              </div>

              {/* Crop Suggestion Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20">
                <div className="text-5xl mb-4 text-center">✂️</div>
                <h3 className="text-2xl font-bold mb-3 text-center" style={{color: '#2d3748'}}>Smart Crop Suggestion</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed text-sm">Get AI-powered crop suggestions based on Rule of Thirds and subject detection for optimal composition.</p>
                <button
                  onClick={() => handleTabChange('crop')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-emerald-500/20"
                >
                  ✂️ Suggest Crop
                </button>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="flex justify-center">
              <div className="animate-bounce">
                <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div id="tools-section" className="bg-white py-16">
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
