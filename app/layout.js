import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Prevent flash of incorrect theme by setting class on initial HTML before hydration
function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();`,
      }}
    />
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gfkorea.com"),
  title: {
    default: "Gluten-Free Korea",
    template: "%s | Gluten-Free Korea",
  },
  description: "Gluten-free places in Korea (Dining & Cafe).",
  openGraph: {
    title: "Gluten-Free Korea",
    description: "Gluten-free places in Korea (Dining & Cafe).",
    url: "/",
    siteName: "Gluten-Free Korea",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Gluten-Free Korea",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeScript />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
