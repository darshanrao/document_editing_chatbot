import type { Metadata } from "next";
import "./globals.css";

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
  themeColor: "#a78bfa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
