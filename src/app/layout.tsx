import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "BM Screeners — Temukan Peluang, Ukur Risiko",
    template: "%s | BM Screeners",
  },
  description:
    "Workspace screener saham IDX: analisis teknikal, fundamental, watchlist, trading plan dan evaluasi strategi.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
