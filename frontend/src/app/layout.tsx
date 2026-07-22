import type { Metadata } from "next";
import { Inter, Lora, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ClientShell } from "@/components/ClientShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bhagavad Gita AI",
    template: "%s | Bhagavad Gita AI",
  },
  description:
    "Ancient wisdom from the Bhagavad Gita, grounded in RAG and translated into practical, non-preachy guidance for modern dilemmas.",
  openGraph: {
    title: "Bhagavad Gita AI",
    description:
      "Ancient Gita wisdom, retrieved and translated into calm, practical guidance for modern life.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${notoDevanagari.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ClientShell>{children}</ClientShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
