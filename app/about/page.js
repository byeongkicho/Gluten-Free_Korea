export const metadata = {
  title: "About GF Korea",
  description: "Helping the gluten-free community navigate Korea safely",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {metadata.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300">
            {metadata.description}
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto prose prose-zinc dark:prose-invert">
          <h1>About GF Korea</h1>
          <p>Helping the gluten-free community navigate Korea safely.</p>

          <h2>Why I Started This Website</h2>
          <p>
            After moving back to Korea, I realized how difficult it is to find
            safe gluten-free food, especially for people like my wife who has
            celiac disease.
          </p>
          <p>
            Even restaurants that claim to offer gluten-free bread sometimes use
            wheat flour blends. I have spent a lot of time researching and
            verifying safe restaurants in Seoul and across Korea, and I want to
            share those tips to help others stay safe.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Our Mission
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Research & Verify
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We thoroughly research and verify each restaurant and product to
                ensure accuracy.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Community Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Building a supportive community for gluten-free travelers and
                residents in Korea.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Education
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Providing practical tips and cultural context for navigating
                Korean cuisine safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Have a restaurant recommendation or found an error? We would love to
            hear from you.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
            <p className="text-gray-600 dark:text-gray-300">
              Email us at:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                hello@gfkorea.com
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              (This is a placeholder - update with your actual contact info)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
