/**
 * Hero Component (Organism)
 * 
 * Apple-inspired hero section for the homepage.
 * Features gradient text, smooth animations, and modern CTAs.
 */

import Link from 'next/link';

export default function Hero() {
  return (
    <section 
      className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-purple-50"
      aria-labelledby="hero-heading"
    >
      {/* Background decoration - Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Purple orb (top-right) */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
        
        {/* Indigo orb (bottom-left) */}
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        
        {/* Pink accent orb (middle-right) */}
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-gradient-to-l from-pink-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm rounded-full shadow-soft border border-gray-200 animate-fade-in">
          <span className="text-2xl">⏱️</span>
          <span className="text-sm font-medium text-gray-700">Track Your Intermittent Fasting</span>
        </div>

        {/* Main Headline */}
        <h1 
          id="hero-heading" 
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up"
          style={{animationDelay: '0.1s'}}
        >
          Take Control of Your{' '}
          <span className="gradient-text">
            Fasting Journey
          </span>
        </h1>

        {/* Subheadline */}
        <p 
          className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up"
          style={{animationDelay: '0.2s'}}
        >
          Track your fasting windows, monitor your progress, and achieve your health goals 
          with our intuitive fasting tracker. Start your transformation today.
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up"
          style={{animationDelay: '0.3s'}}
        >
          <Link 
            href="/register" 
            className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto"
          >
            Get Started Free →
          </Link>
          <Link 
            href="/features" 
            className="btn btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
          >
            Learn More
          </Link>
        </div>

        {/* Feature Highlights */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in"
          style={{animationDelay: '0.4s'}}
        >
          <div className="flex flex-col items-center gap-3 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1">
            <span className="text-4xl">⏱️</span>
            <span className="text-sm font-semibold text-gray-700">Easy Tracking</span>
            <span className="text-xs text-gray-500">Log fasts in seconds</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1">
            <span className="text-4xl">📊</span>
            <span className="text-sm font-semibold text-gray-700">Progress Insights</span>
            <span className="text-xs text-gray-500">See your streaks</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1">
            <span className="text-4xl">🎯</span>
            <span className="text-sm font-semibold text-gray-700">Goal Setting</span>
            <span className="text-xs text-gray-500">Achieve your targets</span>
          </div>
        </div>
      </div>
    </section>
  );
}
