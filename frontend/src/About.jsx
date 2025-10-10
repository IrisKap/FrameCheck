import React from 'react';

const About = ({ onNavigateToTool }) => {
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
          <span 
            onClick={() => onNavigateToTool('features')}
            className="hover:opacity-70 transition-colors font-medium text-xl text-black cursor-pointer"
          >
            Features
          </span>
          <span className="hover:opacity-70 transition-colors font-medium text-xl text-black cursor-pointer">About</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-8 serif-font text-white drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
              About FrameCheck
            </h1>
            <p className="text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto drop-shadow-md" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
              The story behind the tool that's helping photographers capture their best shots
            </p>
          </div>

          {/* Main Story */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 mb-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-8 text-center">📸</div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  Hi! I'm a student and amateur photographer, and I built FrameCheck out of a personal frustration: knowing the rules of good composition—like the rule of thirds and leading lines—but struggling to apply them perfectly in the moment.
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  This project started as a way to combine my studies in computer science with my passion for photography, offering instant, objective feedback on composition. I designed the core features, including the image analysis and AI-generated critique, to be exactly what a beginner or fellow amateur needs: concise, positive, and focused on tangible improvements like suggested crop and rotation.
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed">
                  My goal is simple: to make the science of composition accessible, helping everyone move beyond guesswork and capture their best shot. 📸
                </p>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl p-8 shadow-xl border border-emerald-200 mb-12">
            <h2 className="text-3xl font-bold text-center mb-6" style={{color: '#2d3748'}}>
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 text-center leading-relaxed max-w-2xl mx-auto">
              To democratize photography education by making advanced composition analysis accessible to everyone, 
              from beginners to professionals, through the power of AI and computer vision.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3" style={{color: '#2d3748'}}>AI-Powered Analysis</h3>
              <p className="text-gray-600 text-sm">
                Advanced computer vision algorithms analyze your images for composition, lighting, and visual balance.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3" style={{color: '#2d3748'}}>Educational Focus</h3>
              <p className="text-gray-600 text-sm">
                Learn photography principles through instant feedback and practical suggestions for improvement.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3" style={{color: '#2d3748'}}>Practical Tools</h3>
              <p className="text-gray-600 text-sm">
                Get actionable suggestions for cropping, rotation, and composition optimization.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-3xl font-bold mb-4" style={{color: '#2d3748'}}>
                Ready to Improve Your Photography?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Try our tools and see the difference AI-powered feedback can make
              </p>
              <button
                onClick={() => onNavigateToTool('home')}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
