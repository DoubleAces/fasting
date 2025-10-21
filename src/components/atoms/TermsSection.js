/**
 * TermsSection Atom Component
 * 
 * Individual section of the terms and conditions with anchor link support.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Section ID for anchor linking (kebab-case)
 * @param {string} props.title - Section heading text
 * @param {string|React.ReactNode} props.content - Section content (text or JSX)
 * @param {boolean} [props.highlighted=false] - Whether to highlight section (for important sections like Health Disclaimer)
 * @returns {React.ReactElement} TermsSection component
 * 
 * @example
 * <TermsSection 
 *   id="health-disclaimer" 
 *   title="Health Disclaimer" 
 *   content="This app is not medical advice..."
 *   highlighted={true}
 * />
 */

'use client';

import { useRouter } from 'next/navigation';

export default function TermsSection({ id, title, content, highlighted = false }) {
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

  // Base classes for section container
  const sectionClasses = [
    'mb-8',
    highlighted && 'bg-yellow-50 border-l-4 border-yellow-500 pl-6 py-4',
  ].filter(Boolean).join(' ');

  // Heading classes with hover effect for clickable appearance
  const headingClasses = [
    'text-2xl font-bold mb-4 mt-8 text-gray-900',
    'cursor-pointer hover:text-blue-600',
    'transition-colors duration-200',
    'group relative',
  ].join(' ');

  // Content classes
  const contentClasses = 'text-gray-700 leading-relaxed mb-6';

  // Parse content for paragraphs (support \n\n as paragraph separator)
  const renderContent = () => {
    if (typeof content === 'string') {
      // Check if content contains HTML
      if (content.includes('<')) {
        return <div className={contentClasses} dangerouslySetInnerHTML={{ __html: content }} />;
      }
      
      // Split by double newlines for paragraphs
      const paragraphs = content.split('\n\n').filter(p => p.trim());
      
      if (paragraphs.length > 1) {
        return paragraphs.map((para, index) => (
          <p key={index} className={contentClasses}>
            {para}
          </p>
        ));
      }
      
      // Single paragraph
      return <p className={contentClasses}>{content}</p>;
    }
    
    // Content is already JSX
    return <div className={contentClasses}>{content}</div>;
  };

  return (
    <section className={sectionClasses}>
      <h2 
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
        {/* Link icon that appears on hover */}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 text-lg" aria-hidden="true">
          #
        </span>
      </h2>
      {renderContent()}
    </section>
  );
}
