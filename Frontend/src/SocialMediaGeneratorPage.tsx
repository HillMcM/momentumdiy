import React, { useState } from 'react';
import SocialMediaGeneratorApp from './components/socialGenerator/SocialMediaGeneratorApp';

export default function SocialMediaGeneratorPage() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F0A1A] text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#191628] to-[#65170C] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              AI-Powered Social Media Generator
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto">
              Create stunning social media posts in seconds with Gemini Nano Banana - the most advanced AI image generator available
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <span className="text-sm font-semibold">🎨 Multiple Aspect Ratios</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <span className="text-sm font-semibold">🎯 Brand Customization</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <span className="text-sm font-semibold">⚡ Instant Generation</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <span className="text-sm font-semibold">🤖 Gemini Nano Banana AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Powered by Gemini Nano Banana</h2>
              <p className="text-lg text-white/80 mb-6">
                We use Google's most advanced AI image generation model - Gemini Nano Banana - 
                to create professional-quality social media graphics that match your brand perfectly.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-[#EF8E81] text-xl">✨</span>
                  <span>Generate 2 unique variations of each post</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#EF8E81] text-xl">🎨</span>
                  <span>Support for all major social media aspect ratios</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#EF8E81] text-xl">🎯</span>
                  <span>Brand-aware generation with your logo and colors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#EF8E81] text-xl">⚡</span>
                  <span>Lightning-fast generation in under 30 seconds</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#EF8E81]/20 to-[#65170C]/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Perfect for:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm font-semibold">Instagram Posts</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📘</div>
                  <div className="text-sm font-semibold">Facebook Posts</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🐦</div>
                  <div className="text-sm font-semibold">Twitter/X Posts</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <div className="text-sm font-semibold">LinkedIn Posts</div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <div className="w-16 h-16 bg-[#EF8E81] rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">1</div>
                <h3 className="text-xl font-bold mb-4">Enter Your Content</h3>
                <p className="text-white/80">Type your post text and select the platform you're creating for</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <div className="w-16 h-16 bg-[#EF8E81] rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">2</div>
                <h3 className="text-xl font-bold mb-4">Customize Your Brand</h3>
                <p className="text-white/80">Upload your logo and set your brand colors for consistent styling</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <div className="w-16 h-16 bg-[#EF8E81] rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">3</div>
                <h3 className="text-xl font-bold mb-4">Generate & Download</h3>
                <p className="text-white/80">Get 2 unique designs powered by Gemini 2.5 Flash-Lite AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generator App */}
      <div className="py-16 px-6 bg-gradient-to-br from-[#191628] to-[#0F0A1A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Start Creating</h2>
            <p className="text-lg text-white/80 mb-8">Use the generator below to create your next viral social media post</p>
            <div className="bg-gradient-to-r from-[#EF8E81] to-[#65170C] rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Ready to Generate?</h3>
              <p className="text-white/90 mb-6">
                Click the button below to open the AI generator and create 2 unique, 
                brand-aware social media graphics in seconds!
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold">⚡ Under 30 seconds</span>
                <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold">🎨 2 unique designs</span>
                <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold">🎯 Brand aware</span>
                <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold">💰 Cost optimized</span>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="bg-white text-[#EF8E81] font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-colors text-lg"
              >
                🎨 Open AI Generator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Modal */}
      <SocialMediaGeneratorApp 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />
    </div>
  );
}
