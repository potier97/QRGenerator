import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QR Generator",
  description: "Create custom QR codes with advanced customization options",
  authors: [{ name: "Nicolas Potier", url: "https://github.com/potier97" }],
  keywords: ["QR", "generator", "custom", "code", "qrcode", "personalized"],
  openGraph: {
    title: "QR Generator",
    description: "Create custom QR codes with advanced customization options",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
