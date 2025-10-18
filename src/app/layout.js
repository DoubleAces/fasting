import "./globals.css";

export const metadata = {
  title: "Fasting Tracker",
  description: "Track your intermittent fasting journey",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
