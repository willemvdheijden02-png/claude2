"use server";

import { revalidatePath } from "next/cache";
import { getCurrentContext } from "@/lib/auth/current";
import { markAllRead } from "@/lib/notifications";

export async function markAllNotificationsRead(): Promise<void> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return;
  await markAllRead(ctx.agency.id);
  revalidatePath("/portal/notifications");
  revalidatePath("/portal");
}
