import type { Metadata } from "next";
import { MorrowLoginClient } from "@/components/auth/morrow-login-client";

export const metadata: Metadata = {
  title: "Enter Morrow",
  description: "A calm entrance to your private Morrow command workspace.",
};

export default function LoginPage() {
  return <MorrowLoginClient />;
}
