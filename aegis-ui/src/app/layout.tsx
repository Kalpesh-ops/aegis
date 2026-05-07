import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Aegis — High-Assurance Procurement Gateway",
  description:
    "AI-driven tender evaluation with Dual-Pass Normalization, visual grounding, and an immutable audit ledger for CRPF procurement compliance.",
  keywords: ["CRPF", "tender evaluation", "AI", "procurement", "audit", "government"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${newsreader.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <SmoothScroll>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
