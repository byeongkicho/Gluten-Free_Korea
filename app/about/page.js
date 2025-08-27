import AboutContent, { metadata as aboutMeta } from "@/content/about.mdx";

export const metadata = aboutMeta;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section (from MDX metadata) */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white transition-all duration-300 hover:scale-105">
            {aboutMeta.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
            {aboutMeta.description}
          </p>
        </div>
      </section>

      {/* Story Section (render MDX) */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto prose prose-zinc dark:prose-invert">
          <AboutContent />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white transition-all duration-300 hover:scale-105">
            Our Mission
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transform active:scale-95">
              <div className="text-4xl mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                🔍
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400">
                Research & Verify
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
                We thoroughly research and verify each restaurant and product to
                ensure accuracy.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-green-50 dark:hover:bg-gray-800 cursor-pointer transform active:scale-95">
              <div className="text-4xl mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                🤝
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-300 hover:text-green-600 dark:hover:text-green-400">
                Community Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
                Building a supportive community for gluten-free travelers and
                residents in Korea.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-purple-50 dark:hover:bg-gray-800 cursor-pointer transform active:scale-95">
              <div className="text-4xl mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                📚
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-300 hover:text-purple-600 dark:hover:text-purple-400">
                Education
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
                Providing practical tips and cultural context for navigating
                Korean cuisine safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white transition-all duration-300 hover:scale-105">
            What We Believe In
          </h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-102 cursor-pointer transform active:scale-98">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300 hover:scale-110 hover:bg-green-200 dark:hover:bg-green-800">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold transition-transform duration-300 hover:rotate-12">
                  ✓
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300 hover:text-green-600 dark:hover:text-green-400">
                  Safety First
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
                  Every recommendation is carefully vetted to ensure it's truly
                  safe for people with celiac disease and gluten sensitivity.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-102 cursor-pointer transform active:scale-98">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300 hover:scale-110 hover:bg-blue-200 dark:hover:bg-blue-800">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold transition-transform duration-300 hover:rotate-12">
                  ✓
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Cultural Understanding
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
                  We respect Korean food culture while helping you navigate it
                  safely. Understanding local ingredients and cooking methods is
                  key.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-102 cursor-pointer transform active:scale-98">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300 hover:scale-110 hover:bg-purple-200 dark:hover:bg-purple-800">
                <span className="text-purple-600 dark:text-purple-400 text-sm font-bold transition-transform duration-300 hover:rotate-12">
                  ✓
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300 hover:text-purple-600 dark:hover:text-purple-400">
                  Continuous Updates
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
                  We regularly update our information as restaurants change, new
                  places open, and we discover more safe options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white transition-all duration-300 hover:scale-105">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
            Have a restaurant recommendation or found an error? We'd love to
            hear from you!
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer transform active:scale-95">
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
              Email us at:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400 transition-all duration-300 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                hello@gfkorea.com
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300 hover:text-gray-600 dark:hover:text-gray-300">
              (This is a placeholder - update with your actual contact info)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
