import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  applicationName: "DevonOS",
  title: {
    default: "DevonOS Command Center",
    template: "%s · DevonOS",
  },
  description:
    "A focused operating system for communications, projects, intelligence, and daily execution.",
  category: "productivity",
  openGraph: {
    type: "website",
    title: "DevonOS Command Center",
    description: "Clarity for the work that matters.",
    siteName: "DevonOS",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "DevonOS Command Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevonOS Command Center",
    description: "Clarity for the work that matters.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f6f6f8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
