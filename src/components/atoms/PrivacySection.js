/**
 * PrivacySection Atom Component
 * 
 * Individual section of the privacy policy with anchor link support.
 * Adapted from TermsSection.js for privacy policy content.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Section ID for anchor linking (kebab-case)
 * @param {string} props.title - Section heading text
 * @param {React.ReactNode} props.children - Section content
 * @param {2|3} [props.level=2] - Heading level (h2 or h3)
 * @returns {React.ReactElement} PrivacySection component
 * 
 * @example
 * <PrivacySection 
 *   id="information-we-collect" 
 *   title="Information We Collect"
 * >
 *   <p>We collect the following types of information...</p>
 * </PrivacySection>
 */

'use client';

import { useRouter } from 'next/navigation';

export default function PrivacySection({ id, title, children, level = 2 }) {
  const router = useRouter();

  // Handle heading click to update URL with anchor
  const handleHeadingClick = () => {
    // Update URL with anchor hash
    window.history.pushState(null, '', `#${id}`);
    
    // Smooth scroll to the section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Heading classes with hover effect for clickable appearance
  const headingClasses = [
    level === 2 ? 'text-2xl' : 'text-xl',
    'font-bold mb-4 mt-8 text-gray-900',
    'cursor-pointer hover:text-blue-600',
    'transition-colors duration-200',
    'group relative',
  ].join(' ');

  // Content wrapper classes
  const contentClasses = 'text-gray-700 leading-relaxed mb-6';

  // Create heading element dynamically based on level
  const HeadingTag = `h${level}`;

  return (
    <section className="mb-8">
      <HeadingTag
        id={id} 
        className={headingClasses}
        onClick={handleHeadingClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeadingClick();
          }
        }}
        aria-label={`${title} - Click to link to this section`}
        style={{ cursor: 'pointer' }}
      >
        {title}
        {/* Anchor icon hint on hover */}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 text-lg">
          #
        </span>
      </HeadingTag>
      
      <div className={contentClasses}>
        {children}
      </div>
    </section>
  );
}
