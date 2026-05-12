import { redirect } from "next/navigation";
import { getCurrentContext } from "@/lib/auth/current";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login?next=/onboarding");
  if (ctx.agency) redirect("/portal"); // al een agency, geen onboarding nodig

  return (
    <div className="min-h-screen grid place-items-center px-6 py-12 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--accent-glow), transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="size-8 rounded-md bg-[var(--accent-500)] grid place-items-center">
            <span className="text-white font-semibold">W</span>
          </div>
          <span className="font-medium tracking-display text-[18px]">willoe</span>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-medium tracking-display mb-1">
              Welkom, {ctx.profile?.fullName?.split(" ")[0] ?? ctx.authUser.email}
            </h1>
            <p className="text-[var(--text-secondary)] text-[13px]">
              Eén stap om je agency op te zetten. Daarna kun je klanten toevoegen.
            </p>
          </div>

          <OnboardingForm />
        </div>

        <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-6">
          Je kunt de branding later wijzigen via Instellingen.
        </p>
      </div>
    </div>
  );
}
