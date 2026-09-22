import { redirect } from "next/navigation";
import { getCurrentMorrowSession } from "@/lib/morrow-session";

export default async function HomePage() {
  const session = await getCurrentMorrowSession({ touch: false });
  redirect(session ? "/dashboard" : "/login");
}
