/**
 * FAQ Page - SEO Optimized
 */

import FAQClient from './FAQClient';

export const metadata = {
  title: 'FAQ - Frequently Asked Questions | Fasting Tracker',
  description: 'Find answers to common questions about intermittent fasting, using our fasting tracker app, account management, and technical support.',
  keywords: 'fasting FAQ, intermittent fasting questions, fasting tracker help',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ | Fasting Tracker',
    description: 'Find answers to questions about intermittent fasting and our app.',
    url: 'https://fastingtracker.app/faq',
    siteName: 'Fasting Tracker',
    images: [{url: '/og-image.png', width: 1200, height: 630}],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Fasting Tracker',
    description: 'Find answers about intermittent fasting and our app.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
