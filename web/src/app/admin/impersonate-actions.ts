"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function startImpersonation(agencyId: string) {
  const cookieStore = await cookies();
  cookieStore.set("impersonating_agency_id", agencyId, {
    httpOnly: true,
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });
  redirect("/portal");
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonating_agency_id");
  redirect("/admin");
}
