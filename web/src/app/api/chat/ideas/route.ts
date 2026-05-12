import { streamText } from "ai";
import { getAnthropicForCurrentAgency } from "@/lib/studio/providers";
import { IDEAS_SYSTEM_PROMPT } from "@/lib/studio/system-prompts";
import { IntegrationNotConnectedError } from "@/lib/agency-keys";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, attachments } = await req.json();

  try {
    const anthropic = await getAnthropicForCurrentAgency();

    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: string }
    > = [{ type: "text", text: prompt }];

    if (Array.isArray(attachments)) {
      for (const a of attachments) {
        if (a?.type === "image" && typeof a.dataUrl === "string") {
          userContent.push({ type: "image", image: a.dataUrl });
        }
      }
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-6"),
      system: IDEAS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    return result.toTextStreamResponse();
  } catch (err) {
    if (err instanceof IntegrationNotConnectedError) {
      return new Response(
        "Connect je Anthropic API key in /portal/integrations om Video-ideeën te gebruiken.",
        { status: 402 }
      );
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(msg, { status: 500 });
  }
}
