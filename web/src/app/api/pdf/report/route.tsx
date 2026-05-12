import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportPdf, type ReportPdfData } from "@/lib/pdf/report-template";
import { getCurrentContext } from "@/lib/auth/current";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST { markdownReport: string, clientName: string, period?: string, agency: {name, primaryColor} }
 * → PDF download
 *
 * Parses the markdown-ish report from Studio (## headers + body) into sections.
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx?.agency) {
      return new Response("Niet ingelogd of geen agency.", { status: 401 });
    }

    const body = (await req.json()) as {
      markdownReport: string;
      clientName: string;
      period?: string;
      title?: string;
    };

    if (!body.markdownReport || !body.clientName) {
      return new Response("Missing required fields", { status: 400 });
    }

    const sections = parseMarkdownSections(body.markdownReport);
    const today = new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const data: ReportPdfData = {
      title: body.title ?? `Rapport — ${body.clientName}`,
      period: body.period ?? today,
      generatedDate: today,
      agency: {
        name: ctx.agency.displayName,
        primaryColor: ctx.agency.primaryColor,
      },
      client: { name: body.clientName },
      sections,
    };

    const buffer = await renderToBuffer(<ReportPdf data={data} />);
    const filename = `${body.clientName.replace(/[^a-z0-9]/gi, "-")}-rapport.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(msg, { status: 500 });
  }
}

function parseMarkdownSections(md: string): { heading: string; body: string }[] {
  const lines = md.split(/\r?\n/);
  const sections: { heading: string; body: string }[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = headingMatch[1].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }
  // Fallback: als er geen ## headings zijn, alles als één sectie
  if (sections.length === 0 && md.trim()) {
    sections.push({ heading: "Rapport", body: md.trim() });
  }
  return sections;
}
