import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MetadataLocaleSync from "./components/MetadataLocaleSync";

// Set theme and language classes before hydration to avoid UI flicker.
function InitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => {
  try {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    const savedLang = localStorage.getItem('lang');
    const lang = savedLang === 'ko' ? 'ko' : 'en';
    document.documentElement.classList.remove('lang-en', 'lang-ko');
    document.documentElement.classList.add(lang === 'ko' ? 'lang-ko' : 'lang-en');
    document.documentElement.setAttribute('lang', lang === 'ko' ? 'ko' : 'en');
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const defaultTitle = "GF Korea";
const defaultDescription = "A guide to gluten-free living and safe eats in Korea.";
const defaultOgImage = "/og-default.png";

export const metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: defaultTitle,
  description: defaultDescription,
  openGraph: {
    type: "website",
    url: "/",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "GF Korea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="lang-en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <InitScript />
        <MetadataLocaleSync />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
