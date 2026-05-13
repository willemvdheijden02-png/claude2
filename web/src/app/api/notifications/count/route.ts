import { NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/auth/current";
import { countUnread } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return NextResponse.json({ count: 0 });

  const count = await countUnread(ctx.agency.id, ctx.authUser.id);
  return NextResponse.json({ count });
}
