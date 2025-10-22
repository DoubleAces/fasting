import Navbar from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import { headers } from "next/headers";
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

export default async function RootLayout({ children }) {
  // Get the current pathname to determine if we're in admin area
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminRoute = pathname.startsWith("/dashboard");

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {!isAdminRoute && <Navbar />}
          <main style={{ minHeight: isAdminRoute ? "100vh" : "calc(100vh - 200px)" }}>
            {children}
          </main>
          {!isAdminRoute && <Footer />}
        </SessionProvider>
      </body>
    </html>
  );
}
