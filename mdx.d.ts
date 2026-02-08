declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;

  // Our guides export `export const metadata = { ... }`.
  export const metadata: {
    title: string;
    description: string;
    date?: string;
    updated?: string;
    tags?: string[];
  };
}
