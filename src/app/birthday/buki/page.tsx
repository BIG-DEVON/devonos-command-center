import type { Metadata } from "next";
import { BukiBirthdayExperience } from "./buki-birthday-experience";

export const metadata: Metadata = {
  applicationName: "For HOD Bukkie",
  title: { absolute: "Happy Birthday, HOD Bukkie" },
  description: "A birthday tribute to HOD Bukkie, made with respect, love, and gratitude.",
  category: "celebration",
  manifest: null,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "For HOD Bukkie",
  },
  openGraph: {
    type: "website",
    title: "Happy Birthday, HOD Bukkie",
    description: "A birthday tribute to HOD Bukkie, made with respect, love, and gratitude.",
    siteName: "For HOD Bukkie",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Happy Birthday, HOD Bukkie",
    description: "A birthday tribute to HOD Bukkie, made with respect, love, and gratitude.",
    images: [],
  },
};

export default function BukiBirthdayPage() {
  return <BukiBirthdayExperience />;
}
