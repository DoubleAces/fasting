import Hero from '@/components/organisms/Hero';
import FeaturesList from '@/components/organisms/FeaturesList';

/**
 * HomePage - Public Marketing Page
 * 
 * Landing page showcasing the fasting tracker application.
 * Features hero section with CTAs and features list.
 * 
 * SEO optimized with enhanced metadata for search engines and social sharing.
 */

// Enhanced page-specific metadata
export const metadata = {
  title: "Fasting Tracker - Track Your Intermittent Fasting Journey",
  description: "Track your fasting windows, monitor your progress, and achieve your health goals with our intuitive fasting tracker. Start your transformation today.",
  keywords: "fasting tracker, intermittent fasting, fasting app, health tracker, wellness, weight loss, fasting timer, fasting journal",
  authors: [{ name: "Fasting Tracker Team" }],
  creator: "Fasting Tracker",
  publisher: "Fasting Tracker",
  metadataBase: new URL('https://fastingtracker.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Fasting Tracker - Track Your Intermittent Fasting Journey",
    description: "Track your fasting windows, monitor your progress, and achieve your health goals with our intuitive fasting tracker.",
    url: 'https://fastingtracker.app',
    siteName: 'Fasting Tracker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fasting Tracker - Your Personal Fasting Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fasting Tracker - Track Your Intermittent Fasting Journey',
    description: 'Track your fasting windows, monitor progress, and achieve your health goals.',
    images: ['/twitter-image.png'],
    creator: '@fastingtracker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
};

export default function Home() {
  // Structured data (JSON-LD) for search engines
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://fastingtracker.app/#website',
        url: 'https://fastingtracker.app',
        name: 'Fasting Tracker',
        description: 'Track your intermittent fasting journey with our intuitive fasting tracker app.',
        publisher: {
          '@id': 'https://fastingtracker.app/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://fastingtracker.app/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://fastingtracker.app/#organization',
        name: 'Fasting Tracker',
        url: 'https://fastingtracker.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://fastingtracker.app/logo.png',
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://twitter.com/fastingtracker',
          'https://facebook.com/fastingtracker',
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'Fasting Tracker',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: 'Track your fasting windows, monitor your progress, and achieve your health goals.',
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Hero />
      <FeaturesList />
    </>
  );
}
