import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getAnthropicForCurrentAgency } from "@/lib/studio/providers";
import { IntegrationNotConnectedError } from "@/lib/agency-keys";

export const runtime = "nodejs";
export const maxDuration = 60;

const AGENT_PROMPTS: Record<string, string> = {
  marketing: `Je bent de Marketing Agent van Het Systeem. Je beheert campagnes, KPIs en strategie.
Als je een vraag krijgt die beter past bij een andere agent, antwoord met [ROUTE: agent_id] op de eerste regel.
Beschikbare agents: creative (advertentieteksten/hooks), seo (vindbaarheid), analytics (data/rapporten), research (concurrenten), klantenservice (klantcommunicatie), crm (klantrelaties), automation (automatiseringen).
Geef altijd concrete, actionable antwoorden. Schrijf in het Nederlands.`,

  creative: `Je bent de Creative Agent van Het Systeem. Je schrijft advertentiecopy, hooks en video scripts.
Gebruik altijd het Hook->Pijnpunt->Bewijs->CTA framework. Lever altijd minimaal 3 varianten.
Als de vraag over data/analytics gaat: [ROUTE: analytics]. Over SEO: [ROUTE: seo]. Over strategie: [ROUTE: marketing].
Schrijf in het Nederlands.`,

  seo: `Je bent de SEO Agent van Het Systeem. Je analyseert vindbaarheid, rankings en technische SEO.
Als de vraag over advertenties gaat: [ROUTE: marketing]. Over content copy: [ROUTE: creative]. Over data: [ROUTE: analytics].
Schrijf in het Nederlands.`,

  analytics: `Je bent de Analytics Agent van Het Systeem. Je analyseert data, KPIs en A/B testresultaten.
Als de vraag over ads copy gaat: [ROUTE: creative]. Over strategie: [ROUTE: marketing]. Over klanten: [ROUTE: crm].
Schrijf in het Nederlands.`,

  research: `Je bent de Research Agent van Het Systeem. Je analyseert concurrenten, reviews en markttrends.
Als de vraag over ads gaat: [ROUTE: marketing]. Over copy: [ROUTE: creative]. Over klantdata: [ROUTE: analytics].
Schrijf in het Nederlands.`,

  klantenservice: `Je bent de Klantenservice Agent van Het Systeem. Je beantwoordt klantvragen en lost klachten op.
Als de vraag over klantrelaties/CRM gaat: [ROUTE: crm]. Over campagnes: [ROUTE: marketing].
Schrijf in het Nederlands.`,

  crm: `Je bent de CRM Agent van Het Systeem. Je beheert klantrelaties, segmentaties en retentieflows.
Als de vraag over klantenservice gaat: [ROUTE: klantenservice]. Over email campagnes: [ROUTE: marketing].
Schrijf in het Nederlands.`,

  automation: `Je bent de Automation Agent van Het Systeem. Je plant en bewaakt alle geautomatiseerde taken.
Als de vraag over specifieke marketing taken gaat: [ROUTE: marketing]. Over technische integraties: wijs door naar de relevante agent.
Schrijf in het Nederlands.`,
};

const AGENT_NAMES: Record<string, string> = {
  marketing: "Marketing Agent",
  creative: "Creative Agent",
  seo: "SEO Agent",
  analytics: "Analytics Agent",
  research: "Research Agent",
  klantenservice: "Klantenservice Agent",
  crm: "CRM Agent",
  automation: "Automation Agent",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const { messages } = await req.json();

  const systemPrompt = AGENT_PROMPTS[agentId];
  if (!systemPrompt) {
    return NextResponse.json({ error: "Agent niet gevonden" }, { status: 404 });
  }

  try {
    const anthropic = await getAnthropicForCurrentAgency();

    // Get response from this agent
    const { text: content } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      system: systemPrompt,
      messages,
      maxOutputTokens: 1024,
    });

    // Check for routing
    const routeMatch = content.match(/^\[ROUTE:\s*(\w+)\]/);
    if (routeMatch) {
      const targetAgentId = routeMatch[1];
      const targetPrompt = AGENT_PROMPTS[targetAgentId];

      if (targetPrompt) {
        // Re-route to target agent
        const { text: routedContent } = await generateText({
          model: anthropic("claude-sonnet-4-6"),
          system: targetPrompt,
          messages,
          maxOutputTokens: 1024,
        });

        return NextResponse.json({
          content: routedContent,
          routedTo: { id: targetAgentId, name: AGENT_NAMES[targetAgentId] },
        });
      }
    }

    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof IntegrationNotConnectedError) {
      return NextResponse.json(
        { error: "Connect je Anthropic API key in /portal/integrations om Agents te gebruiken." },
        { status: 402 }
      );
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
