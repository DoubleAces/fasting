/**
 * Settings Layout
 * 
 * Layout for protected settings page with SEO metadata
 */

export const metadata = {
  title: 'Settings - Fasting Tracker',
  description: 'Manage your account settings and preferences.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }) {
  return children;
}
