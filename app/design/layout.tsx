import type { Metadata } from "next";
import type { ReactNode } from "react";

// Sample screens for the design system. They use demo data only and are kept out of search.
export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

export default function DesignLayout({ children }: { children: ReactNode }) {
  return children;
}
