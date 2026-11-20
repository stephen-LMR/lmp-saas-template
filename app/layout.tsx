import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { appConfig } from "@/config/index";
import "./globals.css";

export const metadata: Metadata = {
  title: appConfig.merchant_name
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-mode={appConfig.theme.mode}>
      <body>{children}</body>
    </html>
  );
}
