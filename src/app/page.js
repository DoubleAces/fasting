import Hero from '@/components/organisms/Hero';
import FeaturesList from '@/components/organisms/FeaturesList';

/**
 * HomePage - Public Marketing Page
 * 
 * Landing page showcasing the fasting tracker application.
 * Features hero section with CTAs and features list.
 * 
 * SEO optimized with proper metadata in layout.js
 */
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturesList />
    </>
  );
}
