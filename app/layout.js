import { Fraunces, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { SITE_NAME } from "./lib/site";

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
    document.querySelectorAll('.lang-placeholder').forEach(function(el) {
      var key = lang === 'ko' ? 'langPlaceholderKo' : 'langPlaceholderEn';
      if (el.dataset[key]) el.placeholder = el.dataset[key];
    });
  } catch (e) {}
})();`,
      }}
    />
  );
}

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";
const gaId = "G-Z9FQ9CNJJN";
const defaultTitle = `${SITE_NAME} | 한국 글루텐프리 레스토랑 & 카페 가이드`;
const defaultDescription =
  "Find gluten-free restaurants, cafes, and bakeries across Korea. Verified places with safety notes, maps, and Korean phrases for celiac and gluten-sensitive travelers.";
const defaultOgImage = "/og-default.png";

export const metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  other: {
    "google-adsense-account": "ca-pub-7622506717588067",
  },
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
        alt: "No Gluten Korea – Gluten-Free Restaurant Guide",
      },
    ],
  },
  // title/description/images를 여기 두면 자체 twitter가 없는 모든 페이지(블로그
  // 글 포함)가 사이트 기본값을 상속한다. card만 남기면 X가 og:*로 폴백해
  // 페이지별 제목·이미지를 얻는다.
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="lang-en" suppressHydrationWarning>
      <head>
        {/* Warm up connections to third-party origins that otherwise compete
            on the critical path (ads, analytics, Cloudflare beacon) and delay
            the hero-text LCP on throttled mobile. */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body
        className={`${fraunces.variable} ${dmSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <InitScript />
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7622506717588067`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </Script>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
