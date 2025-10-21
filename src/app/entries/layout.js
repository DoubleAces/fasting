/**
 * Entries Layout
 * 
 * Layout for protected entries page with SEO metadata
 */

export const metadata = {
  title: 'My Entries - Fasting Tracker',
  description: 'View and manage your fasting entries. Track your progress and achieve your health goals.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EntriesLayout({ children }) {
  return children;
}
