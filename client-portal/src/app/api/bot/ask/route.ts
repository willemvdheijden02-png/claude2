import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const { question, agencyId } = await req.json();
    if (!question || !agencyId) {
      return NextResponse.json({ error: "Missing question or agencyId." }, { status: 400 });
    }

    // Load agency's bot knowledge base
    const knowledge = await db
      .select({
        question: schema.botKnowledge.question,
        answer: schema.botKnowledge.answer,
        category: schema.botKnowledge.category,
      })
      .from(schema.botKnowledge)
      .where(
        and(
          eq(schema.botKnowledge.agencyId, agencyId),
          eq(schema.botKnowledge.isActive, true)
        )
      )
      .limit(50);

    const knowledgeText =
      knowledge.length > 0
        ? knowledge
            .map(
              (k) =>
                `Vraag: ${k.question}\nAntwoord: ${k.answer}${k.category ? `\nCategorie: ${k.category}` : ""}`
            )
            .join("\n\n")
        : "Geen specifieke kennisbank beschikbaar.";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: "De bot is momenteel niet beschikbaar." });
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: `Je bent een vriendelijke klantenservice assistent voor een digitaal marketing agency. Je helpt klanten met vragen over diensten, opdrachten en de samenwerking.

Gebruik de volgende kennisbank om vragen te beantwoorden:

${knowledgeText}

Regels:
- Antwoord altijd in het Nederlands
- Wees kort en duidelijk (max 3 alinea's)
- Als je het antwoord niet weet, zeg dat eerlijk en verwijs naar direct contact
- Wees vriendelijk maar professioneel`,
      messages: [{ role: "user", content: question }],
    });

    const answer =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Sorry, ik begrijp je vraag niet.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[bot/ask]", err);
    return NextResponse.json(
      { answer: "Er ging iets mis. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
