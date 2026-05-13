import { redirect } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { getCurrentContext } from "@/lib/auth/current";
import { SettingsTabs } from "./settings-tabs";

export default async function SettingsPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const billingAddress = (ctx.agency.billingAddress ?? {}) as {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };

  return (
    <>
      <Topbar title="Instellingen" description="Branding, account, team en facturatie" />
      <div className="p-4 md:p-6 max-w-4xl">
        <SettingsTabs
          agency={{
            displayName: ctx.agency.displayName,
            primaryColor: ctx.agency.primaryColor,
            logoUrl: ctx.agency.logoUrl,
            kvkNumber: ctx.agency.kvkNumber,
            vatNumber: ctx.agency.vatNumber,
            vatRate: ctx.agency.vatRate,
            billingAddress,
            status: ctx.agency.status,
            slug: ctx.agency.slug,
          }}
          user={{
            email: ctx.profile?.email ?? ctx.authUser.email ?? "",
            fullName: ctx.profile?.fullName ?? "",
          }}
        />
      </div>
    </>
  );
}
