export const metadata = {
  title: "Contact",
  description:
    "How to reach No Gluten Korea — corrections, place submissions, and questions about eating gluten-free in Korea.",
  alternates: { canonical: "/contact" },
};

const reasons = [
  {
    title: "A correction",
    body:
      "If something here is wrong, tell us. This is the message we act on fastest. Point us at the sentence and, if you have it, what you saw instead — a photo of an ingredient panel is ideal.",
  },
  {
    title: "A place we should know about",
    body:
      "A dedicated gluten-free kitchen, a bakery using rice flour, a restaurant whose staff actually understand cross-contamination. Tell us the name and neighborhood; a link to their Naver Place or Instagram helps.",
  },
  {
    title: "A place that closed or moved",
    body:
      "Restaurants turn over quickly and we cannot revisit 24 places every month. If you made a trip and found a shutter, that saves the next reader the same trip.",
  },
  {
    title: "A question about eating gluten-free here",
    body:
      "We answer what we can from experience, and say so plainly when we do not know. We cannot tell you whether a specific dish is safe for your body — that part is between you and your doctor.",
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-fraunces text-3xl font-bold text-fg">Contact</h1>
      <p className="mt-3 text-sm leading-relaxed text-fg/80">
        This site is run by two people who eat gluten-free in Korea, not a company with a
        support desk. Everything comes to one inbox and we read all of it.
      </p>

      <div className="mt-8 rounded-xl border border-rim bg-surface px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Email</p>
        <a
          href="mailto:contact@noglutenkorea.com"
          className="mt-1 block font-fraunces text-xl font-bold text-accent underline underline-offset-4"
        >
          contact@noglutenkorea.com
        </a>
        <p className="mt-3 text-sm text-fg/70">
          We usually reply within a few days. Korean and English are both fine.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-fg">What to write about</h2>
        <div className="mt-4 space-y-5">
          {reasons.map((r) => (
            <div key={r.title}>
              <h3 className="text-sm font-semibold text-fg">{r.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fg/75">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-fg">Elsewhere</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg/80">
          We post finds on Instagram at{" "}
          <a
            href="https://www.instagram.com/noglutenkorea/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline underline-offset-2"
          >
            @noglutenkorea
          </a>
          . For what this site can and cannot tell you, see the{" "}
          <a href="/terms" className="font-medium text-accent underline underline-offset-2">
            terms of use
          </a>
          ; for data handling, the{" "}
          <a href="/privacy" className="font-medium text-accent underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </section>
    </main>
  );
}
