export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const errors: string[] = [];
  const results: Record<string, unknown> = {};

  try {
    const { db, schema } = await import("@/lib/db");
    const { count } = await import("drizzle-orm");
    const rows = await db.select({ n: count() }).from(schema.agencies);
    results.agencies = rows[0]?.n;
  } catch (e) { errors.push("agencies: " + (e instanceof Error ? e.message : String(e))); }

  try {
    const { db, schema } = await import("@/lib/db");
    const { count } = await import("drizzle-orm");
    const rows = await db.select({ n: count() }).from(schema.clients);
    results.clients = rows[0]?.n;
  } catch (e) { errors.push("clients: " + (e instanceof Error ? e.message : String(e))); }

  try {
    const { db, schema } = await import("@/lib/db");
    const { count } = await import("drizzle-orm");
    const rows = await db.select({ n: count() }).from(schema.serviceRequests);
    results.serviceRequests = rows[0]?.n;
  } catch (e) { errors.push("serviceRequests: " + (e instanceof Error ? e.message : String(e))); }

  try {
    const { db, schema } = await import("@/lib/db");
    const { count } = await import("drizzle-orm");
    const rows = await db.select({ n: count() }).from(schema.reports);
    results.reports = rows[0]?.n;
  } catch (e) { errors.push("reports: " + (e instanceof Error ? e.message : String(e))); }

  try {
    const { db, schema } = await import("@/lib/db");
    const { count } = await import("drizzle-orm");
    const rows = await db.select({ n: count() }).from(schema.proposals);
    results.proposals = rows[0]?.n;
  } catch (e) { errors.push("proposals: " + (e instanceof Error ? e.message : String(e))); }

  try {
    const { db, schema } = await import("@/lib/db");
    const { count } = await import("drizzle-orm");
    const rows = await db.select({ n: count() }).from(schema.chatRooms);
    results.chatRooms = rows[0]?.n;
  } catch (e) { errors.push("chatRooms: " + (e instanceof Error ? e.message : String(e))); }

  return NextResponse.json({ errors, results });
}
