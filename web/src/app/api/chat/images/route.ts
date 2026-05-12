import { generateImage, generateObject } from "ai";
import { z } from "zod";
import {
  getAnthropicForCurrentAgency,
  getGoogleForCurrentAgency,
} from "@/lib/studio/providers";
import { IMAGE_SYSTEM_PROMPT } from "@/lib/studio/system-prompts";
import { IntegrationNotConnectedError } from "@/lib/agency-keys";
import type { GeneratedImage } from "@/lib/studio/types";

export const runtime = "nodejs";
export const maxDuration = 90;

const imagePlanSchema = z.object({
  intro: z.string().describe("1-2 zinnen intro voor de gebruiker over de gegenereerde concepten."),
  concepts: z
    .array(
      z.object({
        format: z.enum(["hero", "story", "feed", "square"]),
        prompt: z.string().describe("Gedetailleerde Imagen prompt in het Engels."),
        overlayText: z.string().describe("Korte NL claim voor tekst-overlay (3-6 woorden)."),
      })
    )
    .length(4),
});

const aspectRatios: Record<string, `${number}:${number}`> = {
  hero: "1:1",
  story: "9:16",
  feed: "3:4",
  square: "1:1",
};

const dimensions: Record<string, string> = {
  hero: "1080×1080",
  story: "1080×1920",
  feed: "1080×1350",
  square: "1080×1080",
};

const fallbackPlaceholder = {
  hero: { from: "from-emerald-900/40", to: "to-teal-700/30" },
  story: { from: "from-amber-900/40", to: "to-rose-700/30" },
  feed: { from: "from-indigo-900/40", to: "to-violet-700/30" },
  square: { from: "from-slate-800/60", to: "to-emerald-900/30" },
};

export async function POST(req: Request) {
  const { prompt, attachments } = await req.json();

  try {
    const anthropic = await getAnthropicForCurrentAgency();
    const google = await getGoogleForCurrentAgency();

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

    const plan = await generateObject({
      model: anthropic("claude-sonnet-4-6"),
      system: IMAGE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      schema: imagePlanSchema,
    });

    const imageModel = google.image("imagen-4.0-fast-generate-001");

    const results = await Promise.allSettled(
      plan.object.concepts.map((c) =>
        generateImage({
          model: imageModel,
          prompt: c.prompt,
          aspectRatio: aspectRatios[c.format],
          n: 1,
        })
      )
    );

    const images: GeneratedImage[] = plan.object.concepts.map((c, i) => {
      const result = results[i];
      if (result.status === "fulfilled" && result.value.image) {
        const base64 = result.value.image.base64;
        return {
          id: `img-${Date.now()}-${i}`,
          format: c.format,
          dimensions: dimensions[c.format],
          overlayText: c.overlayText,
          imageUrl: `data:image/png;base64,${base64}`,
          prompt: c.prompt,
          placeholder: fallbackPlaceholder[c.format],
        };
      }
      return {
        id: `img-${Date.now()}-${i}`,
        format: c.format,
        dimensions: dimensions[c.format],
        overlayText: c.overlayText,
        prompt: c.prompt,
        placeholder: fallbackPlaceholder[c.format],
      };
    });

    return Response.json({ intro: plan.object.intro, images });
  } catch (err) {
    if (err instanceof IntegrationNotConnectedError) {
      const provider = err.provider === "anthropic" ? "Anthropic" : "Gemini";
      return Response.json(
        { error: `Connect je ${provider} API key in /portal/integrations om Beelden te genereren.` },
        { status: 402 }
      );
    }
    console.error("[images route]", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
