import Navbar from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ToastProvider } from "@/contexts/ToastContext";
import PWARegistration from "@/components/pwa/PWARegistration";
import PeriodicSync from "@/components/pwa/PeriodicSync";
import OfflineIndicator from "@/components/atoms/OfflineIndicator";
import UpdateBanner from "@/components/molecules/UpdateBanner";
import InstallPrompt from "@/components/molecules/InstallPrompt";
import "./globals.css";

export const metadata = {
  title: "Fasting Tracker - Track Your Intermittent Fasting Journey",
  description: "Track your fasting windows, monitor your progress, and achieve your health goals with our intuitive fasting tracker. Start your transformation today.",
  keywords: "fasting, intermittent fasting, fasting tracker, health, wellness, timer",
  authors: [{ name: "Fasting Tracker" }],
  manifest: "/manifest.json",
  themeColor: "#9333EA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fasting Tracker",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Fasting Tracker - Track Your Intermittent Fasting Journey",
    description: "Track your fasting windows, monitor your progress, and achieve your health goals.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PWARegistration />
        <PeriodicSync />
        <OfflineIndicator />
        <UpdateBanner />
        <InstallPrompt />
        <SessionProvider>
          <ToastProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
