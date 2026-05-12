import { renderToBuffer } from "@react-pdf/renderer";
import { SetupGuidePdf } from "@/lib/pdf/setup-guide-template";
import {
  SETUP_GUIDE_TITLE,
  SETUP_GUIDE_SUBTITLE,
  SETUP_GUIDE_SECTIONS,
} from "@/lib/pdf/setup-guide-data";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    const buffer = await renderToBuffer(
      <SetupGuidePdf
        title={SETUP_GUIDE_TITLE}
        subtitle={SETUP_GUIDE_SUBTITLE}
        sections={SETUP_GUIDE_SECTIONS}
      />
    );

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="Willoe-Setup-Guide.pdf"',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(msg, { status: 500 });
  }
}
