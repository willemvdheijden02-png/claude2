import { redirect } from "next/navigation";

/**
 * Root route (/)
 * - Op Railway: direct naar het agency portal
 * - Lokaal / Vercel: next.config.ts rewrite serveert public/index.html vóór
 *   deze component — maar als die rewrite faalt, stuur dan ook naar /portal
 */
export default function RootPage() {
  // Op Railway altijd naar portaal
  if (process.env.RAILWAY_ENVIRONMENT) {
    redirect("/portal");
  }

  // Lokaal/Vercel: rewrite in next.config.ts pakt dit af (public/index.html)
  // Mocht die missen, dan toch naar portal als fallback
  redirect("/portal");
}
