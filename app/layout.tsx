import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { appConfig, theme } from "@/config/index";
import { themeCss } from "@/design/theme";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: appConfig.merchant_name, template: `%s | ${appConfig.merchant_name}` }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-mode={theme.mode} data-preset={theme.preset_id} className={fontVariables}>
      <head>
        <style>{themeCss(theme)}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
