export default function Footer() {
  return (
    <footer className="border-t border-rim bg-surface">
      {/* Contact section */}
      <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span className="lang-en">Get in touch</span>
          <span className="lang-ko">연락하기</span>
        </p>

        <div className="mt-5 flex items-center justify-center gap-6">
          {/* Email */}
          <a
            href="mailto:contact@noglutenkorea.com"
            className="group/link flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] transition-transform group-hover/link:scale-110"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="underline-offset-2 group-hover/link:underline">
              contact@noglutenkorea.com
            </span>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/noglutenkorea/"
            target="_blank"
            rel="noreferrer"
            className="group/link flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] transition-transform group-hover/link:scale-110"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="underline-offset-2 group-hover/link:underline">
              @noglutenkorea
            </span>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-rim" />
      </div>

      {/* Copyright + affiliate */}
      <div className="mx-auto max-w-3xl px-4 py-6 text-center">
        <p className="text-xs text-muted">
          <span className="lang-en">© 2026 No Gluten Korea</span>
          <span className="lang-ko">© 2026 글루텐프리 코리아</span>
        </p>
        <p className="mt-2 text-[11px] text-muted/40">
          <span className="lang-en">
            Some links are affiliate links (Coupang Partners). We may earn a small commission at no extra cost to you.
          </span>
          <span className="lang-ko">
            일부 링크는 쿠팡 파트너스 제휴 링크이며, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
          </span>
        </p>
      </div>
    </footer>
  );
}
