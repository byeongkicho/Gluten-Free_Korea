const variants = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function Badge({ children, variant = "gray", className = "" }) {
  const cls = variants[variant] || variants.gray;
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${cls} ${className}`}
    >
      {children}
    </span>
  );
}
