export const metadata = {
  title: "Privacy Policy | No Gluten Korea",
  description: "Privacy policy for noglutenkorea.com — how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-fraunces text-3xl font-bold text-fg">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: April 7, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-fg/80">
        <section>
          <h2 className="text-lg font-semibold text-fg">1. Overview</h2>
          <p className="mt-2">
            No Gluten Korea (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates noglutenkorea.com.
            This page explains how we handle information when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">2. Information We Collect</h2>
          <p className="mt-2">
            We do not require account creation or collect personal information directly.
            However, the following data may be collected automatically:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Page views and usage patterns via Google Analytics</li>
            <li>Device type, browser, and approximate location (country/city level)</li>
            <li>Cookies set by Google Analytics and advertising partners</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">3. Google Analytics</h2>
          <p className="mt-2">
            We use Google Analytics to understand how visitors interact with our site.
            Google Analytics collects data such as pages visited, time on site, and referral sources.
            This data is aggregated and does not personally identify you.
            See{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-fg"
            >
              Google&apos;s Privacy Policy
            </a>{" "}
            for more details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">4. Advertising</h2>
          <p className="mt-2">
            We use Google AdSense to display advertisements. Google AdSense may use cookies
            and web beacons to serve ads based on your prior visits to this or other websites.
            You can opt out of personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-fg"
            >
              Google Ads Settings
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">5. Affiliate Links</h2>
          <p className="mt-2">
            Some links on this site are affiliate links (Coupang Partners).
            When you make a purchase through these links, we may earn a small commission
            at no extra cost to you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">6. Cookies</h2>
          <p className="mt-2">
            This site uses cookies for:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Remembering your theme (dark/light) and language preferences</li>
            <li>Google Analytics tracking</li>
            <li>Google AdSense ad personalization</li>
          </ul>
          <p className="mt-2">
            You can disable cookies in your browser settings, though some features may not work as expected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">7. Third-Party Services</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Google Analytics — analytics</li>
            <li>Google AdSense — advertising</li>
            <li>Cloudflare — hosting and CDN</li>
            <li>Cloudinary — image delivery</li>
            <li>Coupang Partners — affiliate links</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">8. Children&apos;s Privacy</h2>
          <p className="mt-2">
            This site is not directed at children under 13.
            We do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">9. Changes</h2>
          <p className="mt-2">
            We may update this policy from time to time.
            Changes will be posted on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">10. Contact</h2>
          <p className="mt-2">
            Questions about this policy? Email us at{" "}
            <a
              href="mailto:contact@noglutenkorea.com"
              className="underline underline-offset-2 hover:text-fg"
            >
              contact@noglutenkorea.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
