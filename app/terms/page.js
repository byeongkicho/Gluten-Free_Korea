export const metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for noglutenkorea.com — what this site is, the limits of the information here, and how affiliate links work.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-fraunces text-3xl font-bold text-fg">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted">Last updated: August 18, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-fg/80">
        <section>
          <h2 className="text-lg font-semibold text-fg">1. What this site is</h2>
          <p className="mt-2">
            No Gluten Korea (noglutenkorea.com) publishes what we have learned about eating
            gluten-free in Korea: how to read Korean food labels, where gluten hides in Korean
            cooking, and which places we have found. It is written from lived experience, not
            from a laboratory or a clinic.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">2. Not medical advice</h2>
          <p className="mt-2">
            Nothing here is medical advice, diagnosis, or treatment. Celiac disease and
            non-celiac gluten sensitivity are medical conditions — decisions about your diet
            belong with you and a qualified healthcare professional. If you are celiac, treat
            every recommendation on this site as a starting point for your own checking, never
            as clearance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">3. Limits of the information</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>
              <strong className="text-fg">Recipes change without notice.</strong> Korean
              manufacturers reformulate products without redesigning the packaging. A product
              that passed a label check last month can fail this month.
            </li>
            <li>
              <strong className="text-fg">Restaurants change.</strong> Menus, suppliers,
              kitchens, and owners change; places close or move. We note what we saw when we
              saw it, with dates where we have them.
            </li>
            <li>
              <strong className="text-fg">Reading a label has limits.</strong> An ingredient
              list establishes what a maker declared. It cannot establish the absence of
              trace gluten from shared equipment.
            </li>
            <li>
              <strong className="text-fg">We are not a testing service.</strong> We do not lab
              test food. Where a claim comes from a manufacturer page, a regulation, or our own
              shopping, we say so.
            </li>
          </ul>
          <p className="mt-3">
            We correct errors when we find them and mark the correction in the article rather
            than quietly editing it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">4. Affiliate links and advertising</h2>
          <p className="mt-2">
            Some outbound links are affiliate links, marked as such where they appear. If you
            buy through one, we may earn a commission at no additional cost to you. This never
            changes whether a product or place is listed — we do not accept payment for
            inclusion or for a favorable write-up. The site may also display third-party
            advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">5. Your use of this site</h2>
          <p className="mt-2">
            You may read, link to, and share this content freely. Please do not republish
            articles wholesale as your own. Quoting with attribution and a link back is
            welcome.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">6. Liability</h2>
          <p className="mt-2">
            This site is provided as is. To the extent permitted by law, we are not liable for
            any loss or harm arising from reliance on the information here. Your safety
            decisions are your own, made with your own checking and, where it matters, your
            doctor.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">7. Contact</h2>
          <p className="mt-2">
            Questions, corrections, or takedown requests:{" "}
            <a
              href="mailto:contact@noglutenkorea.com"
              className="font-medium text-accent underline underline-offset-2"
            >
              contact@noglutenkorea.com
            </a>
            . See our{" "}
            <a href="/contact" className="font-medium text-accent underline underline-offset-2">
              contact page
            </a>{" "}
            for what we can help with.
          </p>
        </section>
      </div>
    </main>
  );
}
