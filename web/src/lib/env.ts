// Robuuste env loader die shell-shadowing omzeilt.
// Next.js negeert .env.local als de variabele al in process.env zit (zelfs als die leeg is).
// Deze helper leest .env.local direct als process.env leeg/missend is.

import fs from "node:fs";
import path from "node:path";

// File-mtime gebaseerde cache: re-read bij elke wijziging van .env.local
let cached: { mtime: number; data: Record<string, string> } | null = null;

function loadEnvLocal(): Record<string, string> {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return {};
  const stat = fs.statSync(file);
  const mtime = stat.mtimeMs;
  if (cached && cached.mtime === mtime) return cached.data;

  const content = fs.readFileSync(file, "utf8");
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    result[key] = value;
  }
  cached = { mtime, data: result };
  return result;
}

export function env(name: string): string | undefined {
  // .env.local wint over process.env (anders krijg je bij token-rotatie de oude waarde
  // omdat Next.js process.env populeert bij server-start en niet refresht).
  const fromFile = loadEnvLocal()[name];
  if (fromFile && fromFile.length > 0) return fromFile;
  const fromProcess = process.env[name];
  if (fromProcess && fromProcess.length > 0) return fromProcess;
  return undefined;
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
