import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __willoeDb: ReturnType<typeof drizzle> | undefined;
}

function getConnectionString(): string {
  const url = env("DATABASE_URL");
  if (!url) throw new Error("DATABASE_URL not set in .env.local");
  return url;
}

// Singleton in dev om hot-reload connection leaks te voorkomen.
function makeDb() {
  const client = postgres(getConnectionString(), {
    prepare: false,
    max: 5,
  });
  return drizzle(client, { schema });
}

export const db = global.__willoeDb ?? (global.__willoeDb = makeDb());
export { schema };
