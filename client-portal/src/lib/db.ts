import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

declare global {
  // eslint-disable-next-line no-var
  var __portalDb: ReturnType<typeof drizzle> | undefined;
}

function makeDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = postgres(url, { prepare: false, max: 3 });
  return drizzle(client, { schema });
}

export const db = global.__portalDb ?? (global.__portalDb = makeDb());
export { schema };
