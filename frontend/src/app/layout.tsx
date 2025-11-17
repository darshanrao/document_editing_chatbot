import type { Metadata } from "next";
import { Roboto_Condensed, Inter } from "next/font/google";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-roboto-condensed',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LegalDoc Filler - AI-Powered Legal Document Assistant",
  description: "Fill your legal documents with AI. Upload your legal document template and let our AI guide you through filling in all the required information conversationally.",
  keywords: ["legal documents", "document automation", "AI assistant", "document filling", "legal tech"],
  authors: [{ name: "LegalDoc Filler Team" }],
  openGraph: {
    title: "LegalDoc Filler - AI-Powered Legal Document Assistant",
    description: "Fill your legal documents with AI assistance",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#B58BFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoCondensed.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
