import { redirect } from "next/navigation";
import { eq, desc, sum, and } from "drizzle-orm";
import { Topbar } from "@/components/shell/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { BillingDashboard } from "./billing-dashboard";

export default async function BillingPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const invoices = await db
    .select({
      id: schema.invoices.id,
      invoiceNumber: schema.invoices.invoiceNumber,
      clientId: schema.invoices.clientId,
      type: schema.invoices.type,
      status: schema.invoices.status,
      issueDate: schema.invoices.issueDate,
      dueDate: schema.invoices.dueDate,
      totalCents: schema.invoices.totalCents,
      pdfUrl: schema.invoices.pdfUrl,
      stripeInvoiceId: schema.invoices.stripeInvoiceId,
    })
    .from(schema.invoices)
    .where(eq(schema.invoices.agencyId, ctx.agency.id))
    .orderBy(desc(schema.invoices.createdAt));

  // Aggregate KPIs
  const paid = invoices.filter((i) => i.status === "paid");
  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const paidThisMonth = paid.reduce((s, i) => s + i.totalCents, 0);
  const outstandingCents = outstanding.reduce((s, i) => s + i.totalCents, 0);
  const overdueCents = overdue.reduce((s, i) => s + i.totalCents, 0);

  const counts = {
    all: invoices.length,
    drafts: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: paid.length,
    overdue: overdue.length,
  };

  return (
    <BillingDashboard
      invoices={invoices}
      kpis={{ paidThisMonth, outstandingCents, overdueCents }}
      counts={counts}
    />
  );
}
