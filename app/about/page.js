export const metadata = {
  title: "About | No Gluten Korea",
  description: "About No Gluten Korea — helping celiac and gluten-sensitive people find safe dining options across Korea.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-fraunces text-3xl font-bold text-fg">
        <span className="lang-en">About No Gluten Korea</span>
        <span className="lang-ko">No Gluten Korea 소개</span>
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-fg/80">
        {/* English */}
        <div className="lang-en space-y-4">
          <p>Hi, I&apos;m Ki.</p>

          <p>
            I live in Korea with my wife, who has non-celiac gluten sensitivity.
            We started No Gluten Korea in 2026 after several years of figuring out
            how to eat together — first in the UK where she was diagnosed, then in
            the US, and now back home in Korea.
          </p>

          <p>
            Learning to cook gluten-free Korean food from scratch took a long time.
            Finding ingredients we could actually use took longer. Finding restaurants
            and cafes where she could safely order — that&apos;s an ongoing project,
            and it&apos;s basically what this site is.
          </p>

          <p>
            Every place listed here is one we&apos;ve been to ourselves. I write about
            what we ate, what we asked the staff, and what they confirmed. When
            I&apos;m not sure, I say so.
          </p>

          <p>
            <strong className="text-fg">No Gluten Korea</strong> is a community-driven guide
            to gluten-free dining in Korea. We help people with celiac disease,
            gluten sensitivity, and wheat allergies find safe places to eat.
          </p>

          <p>
            Living gluten-free in Korea is challenging. Many Korean dishes contain
            hidden gluten in soy sauce, gochujang, and other fermented condiments.
            Communicating dietary needs in Korean adds another layer of difficulty.
          </p>

          <p>
            We personally visit and verify each restaurant, cafe, and bakery listed on
            this site. Every listing includes safety notes, gluten-free menu details,
            and practical tips to help you dine with confidence.
          </p>

          <h2 className="text-lg font-semibold text-fg pt-2">What We Offer</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Verified gluten-free restaurant listings across Korea</li>
            <li>Safety notes and menu guidance for each place</li>
            <li>A comprehensive gluten-free safety guide for Korea</li>
            <li>Korean phrases to communicate your dietary needs</li>
            <li>Regular updates via Instagram{" "}
              <a
                href="https://www.instagram.com/noglutenkorea/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-fg"
              >
                @noglutenkorea
              </a>
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-fg pt-2">Contact</h2>
          <p>
            Have a suggestion for a gluten-free place? Found incorrect information?
            We&apos;d love to hear from you.
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:contact@noglutenkorea.com"
              className="underline underline-offset-2 hover:text-fg"
            >
              contact@noglutenkorea.com
            </a>
            <br />
            Instagram:{" "}
            <a
              href="https://www.instagram.com/noglutenkorea/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-fg"
            >
              @noglutenkorea
            </a>
          </p>
        </div>

        {/* Korean */}
        <div className="lang-ko space-y-4">
          <p>
            <strong className="text-fg">No Gluten Korea</strong>는
            한국의 글루텐프리 외식 정보를 모은 커뮤니티 기반 가이드입니다.
            셀리악병, 글루텐 민감증, 밀 알레르기가 있는 분들이
            안전하게 외식할 수 있도록 돕습니다.
          </p>

          <p>
            한국에서 글루텐프리 식생활은 쉽지 않습니다.
            간장, 고추장 등 발효 조미료에 숨겨진 글루텐이 많고,
            식당에서 식이 요구사항을 전달하는 것도 어렵습니다.
          </p>

          <p>
            이 사이트에 등록된 모든 레스토랑, 카페, 베이커리는
            직접 방문하여 확인한 곳입니다. 각 매장에 안전 안내,
            글루텐프리 메뉴 정보, 실용적인 팁을 제공합니다.
          </p>

          <h2 className="text-lg font-semibold text-fg pt-2">제공 서비스</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>검증된 글루텐프리 매장 리스트 (전국)</li>
            <li>매장별 안전 안내 및 메뉴 가이드</li>
            <li>한국 글루텐프리 생활 종합 가이드</li>
            <li>외식 시 유용한 한국어 표현</li>
            <li>인스타그램{" "}
              <a
                href="https://www.instagram.com/noglutenkorea/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-fg"
              >
                @noglutenkorea
              </a>
              에서 정기 업데이트
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-fg pt-2">연락처</h2>
          <p>
            글루텐프리 매장을 추천하거나, 잘못된 정보를 발견하셨다면 알려주세요.
          </p>
          <p>
            이메일:{" "}
            <a
              href="mailto:contact@noglutenkorea.com"
              className="underline underline-offset-2 hover:text-fg"
            >
              contact@noglutenkorea.com
            </a>
            <br />
            인스타그램:{" "}
            <a
              href="https://www.instagram.com/noglutenkorea/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-fg"
            >
              @noglutenkorea
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
