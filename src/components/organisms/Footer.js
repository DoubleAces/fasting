/**
 * Footer Component - Apple-Inspired Design
 * Modern footer with gradient logo and clean navigation
 */

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-soft transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-semibold text-white">
                Fasting Tracker
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-4">
              Track your fasting journey with ease and achieve your health goals.
            </p>
            <p className="text-sm text-gray-500">
               {currentYear} Fasting Tracker. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">PRODUCT</h3>
            <nav className="flex flex-col gap-3">
              <Link 
                href="/features" 
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Features
              </Link>
              <Link 
                href="/faq" 
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">LEGAL</h3>
            <nav className="flex flex-col gap-3">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </nav>
          </div>

        </div>
      </div>
    </footer>
  );
}
