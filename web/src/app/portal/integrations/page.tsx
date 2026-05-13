import { redirect } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { getCurrentContext } from "@/lib/auth/current";
import { getAllIntegrations, type IntegrationProvider } from "@/lib/agency-keys";
import { IntegrationsList } from "./integrations-list";

export const PROVIDER_INFO: Record<
  IntegrationProvider,
  {
    name: string;
    description: string;
    color: string;
    icon: string;
    requiredFor: string[];
    docsUrl: string;
    fields: { name: string; label: string; placeholder: string; helpText?: string }[];
  }
> = {
  anthropic: {
    name: "Anthropic",
    description: "Claude API voor Scripts, Video-ideeën en Rapporten in de Studio",
    color: "#D97757",
    icon: "A",
    requiredFor: ["Studio · Scripts", "Studio · Ideeën", "Studio · Rapporten"],
    docsUrl: "https://console.anthropic.com",
    fields: [
      {
        name: "api_key",
        label: "API Key",
        placeholder: "sk-ant-api03-...",
        helpText: "Vind 'm op console.anthropic.com → Settings → API Keys",
      },
    ],
  },
  gemini: {
    name: "Google AI Studio (Gemini)",
    description: "Imagen 4 voor AI beelden in de Studio",
    color: "#4285F4",
    icon: "G",
    requiredFor: ["Studio · Beelden"],
    docsUrl: "https://aistudio.google.com",
    fields: [
      {
        name: "api_key",
        label: "API Key",
        placeholder: "AIzaSy...",
        helpText: "Vind 'm op aistudio.google.com → Get API key",
      },
    ],
  },
  meta: {
    name: "Meta Business",
    description: "Live Meta Ads insights data",
    color: "#1877F2",
    icon: "f",
    requiredFor: ["Ads Manager dashboard"],
    docsUrl: "https://developers.facebook.com",
    fields: [
      {
        name: "app_id",
        label: "Meta App ID",
        placeholder: "1234567890",
      },
      {
        name: "access_token",
        label: "Long-lived Access Token",
        placeholder: "EAA...",
        helpText: "Genereer via Graph API Explorer → Extend via Token Debugger",
      },
    ],
  },
  google_ads: {
    name: "Google Ads",
    description: "Google Ads dashboard naast Meta",
    color: "#4285F4",
    icon: "Ads",
    requiredFor: ["Ads Manager · Google tab (komt later)"],
    docsUrl: "https://ads.google.com/aw/apicenter",
    fields: [
      {
        name: "developer_token",
        label: "Developer Token",
        placeholder: "...",
        helpText: "Vraag aan via Manager (MCC) account → Tools → API Center",
      },
      {
        name: "customer_id",
        label: "Customer ID",
        placeholder: "123-456-7890",
      },
    ],
  },
  stripe: {
    name: "Stripe",
    description: "Echte facturen aanmaken + iDEAL/kaart betalingen",
    color: "#635BFF",
    icon: "S",
    requiredFor: ["Facturatie · Invoice maken + ontvangst betalingen"],
    docsUrl: "https://dashboard.stripe.com/apikeys",
    fields: [
      {
        name: "secret_key",
        label: "Secret Key",
        placeholder: "sk_test_... of sk_live_...",
        helpText: "Voor productie: sk_live_. Voor testen: sk_test_.",
      },
      {
        name: "publishable_key",
        label: "Publishable Key",
        placeholder: "pk_test_... of pk_live_...",
      },
    ],
  },
  resend: {
    name: "Resend",
    description: "Automatische factuur emails (optioneel)",
    color: "#000000",
    icon: "R",
    requiredFor: ["Automatische factuur emails"],
    docsUrl: "https://resend.com/api-keys",
    fields: [
      {
        name: "api_key",
        label: "API Key",
        placeholder: "re_...",
      },
    ],
  },
};

export default async function IntegrationsPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const integrations = await getAllIntegrations(ctx.agency.id);

  return (
    <>
      <Topbar
        title="Integraties"
        description="Koppel je eigen API keys — kosten gaan dan op jouw account, niet die van Willoe"
      />
      <div className="p-4 md:p-6 max-w-4xl">
        <IntegrationsList existing={integrations} info={PROVIDER_INFO} />
      </div>
    </>
  );
}
