import type { Metadata, Viewport } from "next";
import { DevonPreferencesProvider } from "@/components/providers/devon-preferences-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  applicationName: "Morrow",
  title: {
    default: "Morrow Command Center",
    template: "%s · Morrow",
  },
  description: "JRB executive workspace.",
  category: "productivity",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Morrow",
  },
  openGraph: {
    type: "website",
    title: "Morrow Command Center",
    description: "JRB executive workspace.",
    siteName: "Morrow",
    images: [
      {
        url: "/og-morrow.png",
        width: 1734,
        height: 907,
        alt: "Morrow Command Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Morrow Command Center",
    description: "JRB executive workspace.",
    images: ["/og-morrow.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#111116" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="antialiased">
        <DevonPreferencesProvider>{children}</DevonPreferencesProvider>
      </body>
    </html>
  );
}
