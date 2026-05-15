import { redirect } from "next/navigation";

/**
 * Root route (/)
 * - Op Railway: direct naar het agency portal
 * - Op Vercel / lokaal: toon de marketing website (public/index.html)
 */
export default function RootPage() {
  if (process.env.RAILWAY_ENVIRONMENT) {
    redirect("/portal");
  }
  // Vercel / lokaal → marketing homepage
  redirect("/index.html");
}
