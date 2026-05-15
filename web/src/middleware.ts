import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Op Railway: stuur de root altijd door naar het agency dashboard
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
  if (isRailway && pathname === "/") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match alle paths behalve:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - api routes (eigen auth check)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)",
  ],
};
