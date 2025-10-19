import Navbar from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata = {
  title: "Fasting Tracker - Track Your Intermittent Fasting Journey",
  description: "Track your fasting windows, monitor your progress, and achieve your health goals with our intuitive fasting tracker. Start your transformation today.",
  keywords: "fasting, intermittent fasting, fasting tracker, health, wellness, timer",
  authors: [{ name: "Fasting Tracker" }],
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
        <SessionProvider>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 200px)" }}>
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
