import React from 'react';

const About = ({ onNavigateToTool }) => {
  return (
    <div className="min-h-screen relative hero-bg">
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6">
        <div className="flex items-center">
          <div 
            onClick={() => onNavigateToTool('home')}
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
            onClick={() => onNavigateToTool('features')}
            className="hover:opacity-70 transition-colors font-medium text-xl text-white cursor-pointer sans-font"
          >
            Features
          </span>
          <span className="hover:opacity-70 transition-colors font-medium text-xl text-white cursor-pointer sans-font">About</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 serif-font text-white drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
              About FrameCheck
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto drop-shadow-md sans-font" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
              The story behind the tool that's helping photographers capture their best shots
            </p>
          </div>

          {/* Main Story */}
          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/10 mb-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-8 text-center">📸</div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-300 leading-relaxed mb-6 sans-font">
                  Hi! I'm a student and amateur photographer, and I built FrameCheck out of a personal frustration: knowing the rules of good composition—like the rule of thirds and leading lines—but struggling to apply them perfectly in the moment.
                </p>
                
                <p className="text-xl text-gray-300 leading-relaxed mb-6 sans-font">
                  This project started as a way to combine my studies in computer science with my passion for photography, offering instant, objective feedback on composition. I designed the core features, including the image analysis and AI-generated critique, to be exactly what a beginner or fellow amateur needs: concise, positive, and focused on tangible improvements like suggested crop and rotation.
                </p>
                
                <p className="text-xl text-gray-300 leading-relaxed sans-font">
                  My goal is simple: to make the science of composition accessible, helping everyone move beyond guesswork and capture their best shot. 📸
                </p>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-8 shadow-xl border border-white/10 mb-12">
            <h2 className="text-3xl font-bold text-center mb-6 text-white serif-font">
              Our Mission
            </h2>
            <p className="text-lg text-gray-300 text-center leading-relaxed max-w-2xl mx-auto sans-font">
              To democratize photography education by making advanced composition analysis accessible to everyone, 
              from beginners to professionals, through the power of AI and computer vision.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3 text-white serif-font">AI-Powered Analysis</h3>
              <p className="text-gray-300 text-sm sans-font">
                Advanced computer vision algorithms analyze your images for composition, lighting, and visual balance.
              </p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-white serif-font">Educational Focus</h3>
              <p className="text-gray-300 text-sm sans-font">
                Learn photography principles through instant feedback and practical suggestions for improvement.
              </p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-white serif-font">Practical Tools</h3>
              <p className="text-gray-300 text-sm sans-font">
                Get actionable suggestions for cropping, rotation, and composition optimization.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
              <h2 className="text-3xl font-bold mb-4 text-white serif-font">
                Ready to Improve Your Photography?
              </h2>
              <p className="text-lg text-gray-300 mb-6 sans-font">
                Try our tools and see the difference AI-powered feedback can make
              </p>
              <button
                onClick={() => onNavigateToTool('home')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg sans-font"
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
