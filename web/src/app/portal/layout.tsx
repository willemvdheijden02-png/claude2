import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { AgencySidebar } from "@/components/shell/agency-sidebar";
import { FirstRunTour } from "@/components/portal/first-run-tour";
import { CrispWidget } from "@/components/portal/crisp-widget";
import { TrialBanner, ExpiredBanner } from "@/components/portal/trial-banner";
import { getCurrentContext } from "@/lib/auth/current";
import { daysLeftInTrial, isTrialActive } from "@/lib/plans";
import { db, schema } from "@/lib/db";
import { stopImpersonation } from "@/app/admin/impersonate-actions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login?next=/portal");
  if (!ctx.agency) redirect("/onboarding");

  // Trial / subscription state — alleen tonen voor trial users
  const isOperator = ctx.profile?.role === "operator";
  const onTrial = ctx.agency.plan === "trial";
  const trialActive = onTrial ? isTrialActive(ctx.agency.trialEndsAt) : false;
  const trialDaysLeft = onTrial ? daysLeftInTrial(ctx.agency.trialEndsAt) : 0;

  // Impersonation — operator meekijken als een andere agency
  const cookieStore = await cookies();
  const impersonatingId = cookieStore.get("impersonating_agency_id")?.value ?? null;
  let impersonatingName: string | null = null;
  if (impersonatingId && isOperator) {
    const [impersonatedAgency] = await db
      .select({ displayName: schema.agencies.displayName })
      .from(schema.agencies)
      .where(eq(schema.agencies.id, impersonatingId))
      .limit(1);
    impersonatingName = impersonatedAgency?.displayName ?? null;
  }

  return (
    <div
      className="flex h-screen w-full"
      style={
        {
          "--accent-500": ctx.agency.primaryColor,
          "--accent-600": ctx.agency.accentColor || ctx.agency.primaryColor,
          "--accent-glow": `${ctx.agency.primaryColor}26`,
        } as React.CSSProperties
      }
    >
      <AgencySidebar
        agencyName={ctx.agency.displayName}
        agencyInitial={ctx.agency.displayName.charAt(0).toUpperCase()}
        userName={ctx.profile?.fullName ?? ctx.authUser.email ?? "Gebruiker"}
        userRole={isOperator ? "Operator + Agency" : "Agency admin"}
        isOperator={isOperator}
        plan={ctx.agency.plan}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Impersonation banner — alleen zichtbaar voor operators die meekijken */}
        {isOperator && impersonatingName && (
          <div className="flex items-center justify-between gap-4 px-4 h-9 bg-[#7c3aed18] border-b border-[#7c3aed40] text-[12px] text-[#c4b5fd] shrink-0">
            <span>
              Je kijkt mee als <strong className="text-white">{impersonatingName}</strong>
            </span>
            <form action={stopImpersonation}>
              <button
                type="submit"
                className="h-6 px-2.5 rounded text-[11px] bg-[#7c3aed30] hover:bg-[#7c3aed50] transition-colors text-[#c4b5fd] hover:text-white"
              >
                Stop meekijken
              </button>
            </form>
          </div>
        )}
        {/* Operator bypassed banner — Willem zelf hoeft 'm niet te zien */}
        {!isOperator && onTrial && trialActive && (
          <TrialBanner daysLeft={trialDaysLeft} />
        )}
        {!isOperator && onTrial && !trialActive && <ExpiredBanner />}
        {!isOperator && ctx.agency.plan === "cancelled" && <ExpiredBanner />}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
      <FirstRunTour />
      <CrispWidget />
    </div>
  );
}
