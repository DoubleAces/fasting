/**
 * FAQ Page Metadata
 * 
 * SEO metadata for the FAQ page
 */

export const metadata = {
  title: 'FAQ - Frequently Asked Questions | Fasting Tracker',
  description: 'Find answers to common questions about intermittent fasting, using our fasting tracker app, account management, and technical support. Get help with tracking your fasting journey.',
  keywords: 'fasting FAQ, intermittent fasting questions, fasting tracker help, fasting app support, how to use fasting tracker, fasting guide',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ - Frequently Asked Questions | Fasting Tracker',
    description: 'Find answers to common questions about intermittent fasting and using our fasting tracker app.',
    url: 'https://fastingtracker.app/faq',
    siteName: 'Fasting Tracker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fasting Tracker FAQ',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Fasting Tracker',
    description: 'Find answers to common questions about intermittent fasting and our app.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
