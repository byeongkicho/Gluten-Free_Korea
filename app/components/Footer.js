export default function Footer() {
  return (
    <footer
      className="text-center py-4 text-sm mt-12"
      style={{
        color: "var(--foreground)",
        borderTop: "1px solid var(--border)",
      }}
    >
      © {new Date().getFullYear()} GF Korea. All rights reserved.
    </footer>
  );
}
