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
  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <>
      <Topbar
        title="Koppelingen"
        description="Jouw eigen API-keys — volledig geïsoleerd van andere agencies"
      />
      <div className="p-4 md:p-6 max-w-4xl space-y-6">

        {/* Data-isolatie info banner */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center gap-3">
            <div className="size-8 rounded-lg bg-[var(--accent-500)]/15 flex items-center justify-center">
              <svg className="size-4 text-[var(--accent-500)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Jouw data is van jou</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {connectedCount} van 6 koppelingen actief · {ctx.agency.displayName}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-default)]">
            <IsolationPill
              icon="🔑"
              title="Eigen API-keys"
              body="Elke koppeling die je hier toevoegt staat alleen op jouw account. Geen andere agency ziet of gebruikt jouw keys."
            />
            <IsolationPill
              icon="🗄️"
              title="Eigen data"
              body="Klantdata, KPIs, opdrachten en documenten zijn volledig geïsoleerd. Andere agencies zien nooit jouw klanten."
            />
            <IsolationPill
              icon="💳"
              title="Eigen kosten"
              body="API-kosten (Meta, Google, Anthropic) gaan direct op jouw account. Je betaalt alleen wat jij gebruikt."
            />
          </div>
        </div>

        <IntegrationsList existing={integrations} info={PROVIDER_INFO} />
      </div>
    </>
  );
}

function IsolationPill({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[18px] mb-2">{icon}</div>
      <p className="text-[12px] font-medium text-[var(--text-primary)] mb-1">{title}</p>
      <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{body}</p>
    </div>
  );
}
