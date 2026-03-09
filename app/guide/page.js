export const metadata = {
  title: "Guide | Gluten-Free Korea",
  description: "Basic gluten-free safety guide for Korea.",
};

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guide</h1>
        <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            This is a minimal MVP guide page. Keep it short, practical, and safety-first.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Ask staff clearly about wheat, barley, and rye.</li>
            <li>Always ask about shared fryer/oil and prep tools.</li>
            <li>When unsure, choose naturally gluten-free dishes.</li>
            <li>Re-check menu and ingredients every visit.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
