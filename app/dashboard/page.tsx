import { redirect } from "next/navigation";
import { getSession } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Sends each signed-in user to the home that fits their role. */
export default async function DashboardRedirect() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");
  if (session.user.role === "SELLER") redirect("/seller/dashboard");
  redirect("/");
}
