import React from 'react';

const Features = ({ onNavigateToTool }) => {
  const features = [
    {
      id: 'analysis',
      title: 'Composition Analysis',
      icon: '📐',
      description: 'Get AI-powered analysis of your photography composition including rule of thirds, leading lines, and detailed feedback.',
      benefits: [
        'Rule of thirds grid analysis',
        'Leading lines detection',
        'AI-powered composition feedback',
        'Visual overlays and guides',
        'Technical analysis summary'
      ],
      buttonText: 'Try Composition Analysis',
      buttonColor: 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
    },
    {
      id: 'similarity',
      title: 'Style Similarity',
      icon: '🎨',
      description: 'Discover which famous photographers share your visual style by uploading up to 4 images for analysis.',
      benefits: [
        'Compare with 10 famous photographers',
        'Upload up to 4 images at once',
        'Similarity percentage scores',
        'Photographer descriptions and backgrounds',
        'Visual style matching'
      ],
      buttonText: 'Try Style Similarity',
      buttonColor: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
    },
    {
      id: 'crop',
      title: 'Smart Crop Suggestion',
      icon: '✂️',
      description: 'Get AI-powered crop suggestions based on Rule of Thirds and subject detection for optimal composition.',
      benefits: [
        'Automatic subject detection',
        'Rule of Thirds optimization',
        'Composition improvement suggestions',
        'Before/after comparison',
        'Download optimized images'
      ],
      buttonText: 'Try Crop Suggestion',
      buttonColor: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    }
  ];

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
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6">
        <div className="flex items-center">
          <div 
            onClick={() => onNavigateToTool('home')}
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
          <a href="#" className="hover:opacity-80 transition-colors font-black serif-font text-2xl text-black drop-shadow-md" style={{textShadow: '1px 1px 2px rgba(255,255,255,0.3)'}}>Features</a>
          <a href="#" className="hover:opacity-80 transition-colors font-black serif-font text-2xl text-black drop-shadow-md" style={{textShadow: '1px 1px 2px rgba(255,255,255,0.3)'}}>About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-8 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-8 serif-font text-white drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
            FrameCheck Features
          </h1>
          <p className="text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto drop-shadow-md" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
            Professional photography analysis tools powered by AI and computer vision
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
                {/* Feature Header */}
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4">{feature.icon}</div>
                  <h2 className="text-4xl font-bold mb-4" style={{color: '#2d3748'}}>{feature.title}</h2>
                  <p className="text-xl text-gray-600 leading-relaxed">{feature.description}</p>
                </div>

                {/* Benefits List */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">✨ What You Get:</h3>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Try Button */}
                <div className="text-center">
                  <button
                    onClick={() => onNavigateToTool(feature.id)}
                    className={`w-full bg-gradient-to-r ${feature.buttonColor} text-white px-8 py-4 font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-white/20`}
                  >
                    {feature.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-center mb-8" style={{color: '#2d3748'}}>🚀 How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📤</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">1. Upload</h3>
                <p className="text-gray-600">Upload your photos using drag & drop or file selection</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">2. Analyze</h3>
                <p className="text-gray-600">Our AI analyzes your image using advanced computer vision</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">3. Learn</h3>
                <p className="text-gray-600">Get detailed feedback and suggestions to improve your photography</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <span
            onClick={() => onNavigateToTool('home')}
            className="hover:opacity-70 transition-colors font-medium text-xl text-black cursor-pointer"
          >
            ← Back to Home
          </span>
        </div>
      </div>
    </div>
  );
};

export default Features;
