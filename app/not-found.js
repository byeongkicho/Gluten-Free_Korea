import Link from "next/link";

export const metadata = {
  title: "Not Found | Gluten-Free Korea",
};

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <span className="lang-en">← Back to list</span>
          <span className="lang-ko">← 목록으로 돌아가기</span>
        </Link>
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white sm:text-3xl">
            <span className="lang-en">Page not found</span>
            <span className="lang-ko">페이지를 찾을 수 없습니다</span>
          </h1>
        </section>
      </div>
    </main>
  );
}
