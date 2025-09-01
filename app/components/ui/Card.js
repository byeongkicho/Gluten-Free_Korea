export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}
    >
      {children}
    </div>
  );
}
