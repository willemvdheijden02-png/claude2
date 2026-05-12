export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    cwd: process.cwd(),
    has_anthropic: !!process.env.ANTHROPIC_API_KEY,
    has_google: !!process.env.GOOGLE_API_KEY,
    anthropic_prefix: process.env.ANTHROPIC_API_KEY?.slice(0, 25) ?? null,
    google_prefix: process.env.GOOGLE_API_KEY?.slice(0, 15) ?? null,
    node_env: process.env.NODE_ENV,
  });
}
