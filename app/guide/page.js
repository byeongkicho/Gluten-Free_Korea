export const metadata = {
  title: "Guide | Gluten-Free Korea",
  description: "Basic gluten-free safety guide for Korea.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          <span className="lang-en">Safety Guide</span>
          <span className="lang-ko">안전 가이드</span>
        </h1>
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <ul className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <li>
              <span className="lang-en">
                Clearly ask whether wheat, barley, or rye is included.
              </span>
              <span className="lang-ko">밀, 보리, 호밀 포함 여부를 직원에게 명확히 확인하세요.</span>
            </li>
            <li>
              <span className="lang-en">
                Ask if fryers, oil, or prep tools are shared.
              </span>
              <span className="lang-ko">튀김기/기름/조리도구를 함께 쓰는지 반드시 물어보세요.</span>
            </li>
            <li>
              <span className="lang-en">
                If uncertain, choose dishes with simple ingredients.
              </span>
              <span className="lang-ko">확신이 없으면 원재료가 단순한 메뉴를 선택하세요.</span>
            </li>
            <li>
              <span className="lang-en">Reconfirm every visit, even at the same place.</span>
              <span className="lang-ko">같은 매장이라도 방문할 때마다 다시 확인하세요.</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
