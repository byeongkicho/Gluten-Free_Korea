"use client";

import { MDXProvider } from "@mdx-js/react";

export default function MDXClientRenderer({ children }) {
  return <div className="prose dark:prose-invert">{children}</div>;
}