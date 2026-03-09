export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <span className="lang-en">© {new Date().getFullYear()} Gluten-Free Korea</span>
      <span className="lang-ko">© {new Date().getFullYear()} 글루텐프리 코리아</span>
    </footer>
  );
}
