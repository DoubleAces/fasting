import React from 'react';
import TestimonialCard from '@/components/molecules/TestimonialCard';
import TrustBadge from '@/components/molecules/TrustBadge';
import testimonials from '@/lib/data/testimonials';
import trustIndicators from '@/lib/data/trustIndicators';

/**
 * SocialProofSection Component
 * 
 * Displays social proof through testimonials and trust indicators.
 * Shows 6 testimonials in a responsive grid with trust badges above.
 * 
 * @param {string} [className] - Additional CSS classes
 */
const SocialProofSection = ({ className = '' }) => {
  return (
    <section className={`relative py-20 px-4 md:px-8 bg-gradient-to-br from-purple-100 via-pink-100 to-white overflow-hidden ${className}`}>
      {/* Decorative gradient orbs */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-pink-400/30 to-purple-400/30 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6 pb-2">
            Trusted by thousands of fasters
          </h2>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 mb-4">
            <TrustBadge 
              indicator={trustIndicators.rating} 
              variant="inline"
              size="md"
            />
            <TrustBadge 
              indicator={trustIndicators.userCount} 
              variant="inline"
              size="md"
            />
            <TrustBadge 
              indicator={trustIndicators.successRate} 
              variant="inline"
              size="md"
            />
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              variant="default"
              showDate={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
