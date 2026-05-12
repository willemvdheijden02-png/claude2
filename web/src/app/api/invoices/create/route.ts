import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getStripeForCurrentAgency } from "@/lib/stripe/server";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { IntegrationNotConnectedError } from "@/lib/agency-keys";

export const runtime = "nodejs";
export const maxDuration = 30;

type InvoiceType = "monthly_fee" | "service" | "onboarding";

const typeLabels: Record<InvoiceType, string> = {
  monthly_fee: "Maandelijkse fee",
  service: "Service",
  onboarding: "Onboarding pipeline",
};

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx?.agency) {
      return Response.json({ error: "Niet ingelogd of geen agency." }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientName,
      clientEmail,
      clientId,
      type,
      amount,
      vatRate,
      description,
    }: {
      clientName: string;
      clientEmail: string;
      clientId?: string;
      type: InvoiceType;
      amount: number;
      vatRate: number;
      description?: string;
    } = body;

    if (!clientName || !clientEmail || !amount || vatRate === undefined) {
      return Response.json({ error: "Vul alle velden in" }, { status: 400 });
    }

    const stripe = await getStripeForCurrentAgency();
    const subtotalCents = Math.round(amount * 100);
    const vatCents = Math.round((subtotalCents * vatRate) / 100);
    const totalCents = subtotalCents + vatCents;

    // Stripe customer
    const existing = await stripe.customers.list({ email: clientEmail, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email: clientEmail,
        name: clientName,
        metadata: { source: "willoe", agency_id: ctx.agency.id, invoice_type: type },
      }));

    // Stripe invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 14,
      description: description || `${typeLabels[type]} via Willoe`,
      metadata: { source: "willoe", agency_id: ctx.agency.id, invoice_type: type },
    });
    if (!invoice.id) throw new Error("Stripe invoice has no ID");

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      currency: "eur",
      amount: subtotalCents,
      description: description || typeLabels[type],
    });

    if (vatCents > 0) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        currency: "eur",
        amount: vatCents,
        description: `BTW ${vatRate}%`,
      });
    }

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    if (!finalized.id) throw new Error("Stripe finalized invoice has no ID");
    const sent = await stripe.invoices.sendInvoice(finalized.id);

    // Save in onze DB
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);

    await db.insert(schema.invoices).values({
      agencyId: ctx.agency.id,
      clientId: clientId ?? null,
      invoiceNumber: sent.number,
      type,
      status: "sent",
      issueDate: today.toISOString().slice(0, 10),
      dueDate: dueDate.toISOString().slice(0, 10),
      subtotalCents,
      vatRate,
      vatCents,
      totalCents,
      description: description ?? null,
      pdfUrl: sent.invoice_pdf,
      stripeInvoiceId: sent.id,
      sentAt: new Date(),
    });

    return Response.json({
      success: true,
      invoiceId: sent.id,
      invoiceNumber: sent.number,
      hostedInvoiceUrl: sent.hosted_invoice_url,
      pdfUrl: sent.invoice_pdf,
      status: sent.status,
      totalCents,
      vatCents,
      subtotalCents,
      customerEmail: clientEmail,
    });
  } catch (err) {
    if (err instanceof IntegrationNotConnectedError) {
      return Response.json(
        { error: "Connect je Stripe keys in /portal/integrations om facturen te maken." },
        { status: 402 }
      );
    }
    console.error("[invoices/create]", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
