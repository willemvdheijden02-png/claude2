import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type InvoicePdfData = {
  invoiceNumber: string;
  issueDate: string; // formatted "11 mei 2026"
  dueDate: string;
  agency: {
    name: string;
    primaryColor: string;
    kvk?: string | null;
    vatNumber?: string | null;
    address?: { street?: string; city?: string; postalCode?: string; country?: string } | null;
    logoUrl?: string | null;
  };
  client: {
    name: string;
    email: string;
    address?: string | null;
  };
  lineItems: { description: string; amountCents: number }[];
  vatRate: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  paymentLink?: string | null;
  paymentTerms?: string;
};

function eur(cents: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0a0a0a",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  brandBlock: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  brandSquareText: { color: "#ffffff", fontSize: 16, fontFamily: "Helvetica-Bold" },
  brandName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0a0a0a" },
  invoiceMeta: { textAlign: "right" },
  invoiceLabel: {
    fontSize: 9,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  invoiceNumber: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  sectionGrid: { flexDirection: "row", gap: 40, marginBottom: 32 },
  sectionCol: { flex: 1 },
  sectionLabel: {
    fontSize: 9,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionValue: { fontSize: 11, color: "#0a0a0a", lineHeight: 1.5 },
  sectionStrong: { fontFamily: "Helvetica-Bold" },
  table: {
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  th: {
    fontSize: 9,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  thLeft: { flex: 1 },
  thRight: { width: 100, textAlign: "right" },
  tdDescription: { flex: 1, fontSize: 11, color: "#0a0a0a" },
  tdAmount: { width: 100, textAlign: "right", fontSize: 11, color: "#0a0a0a" },
  totals: {
    marginLeft: "auto",
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalLabel: { fontSize: 11, color: "#525252" },
  totalValue: { fontSize: 11, color: "#0a0a0a" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#0a0a0a",
  },
  grandTotalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#0a0a0a" },
  grandTotalValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#0a0a0a" },
  paymentBlock: {
    marginTop: 40,
    padding: 16,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  paymentLabel: {
    fontSize: 9,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  paymentTerms: { fontSize: 10, color: "#525252", lineHeight: 1.5 },
  paymentLink: {
    fontSize: 11,
    marginTop: 8,
    textDecoration: "underline",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#a3a3a3",
  },
});

export function InvoicePdf({ data }: { data: InvoicePdfData }) {
  return (
    <Document
      title={`Factuur ${data.invoiceNumber}`}
      author={data.agency.name}
      creator="Willoe"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <View style={[styles.brandSquare, { backgroundColor: data.agency.primaryColor }]}>
              <Text style={styles.brandSquareText}>
                {data.agency.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.brandName}>{data.agency.name}</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>Factuur</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* From / To / Dates */}
        <View style={styles.sectionGrid}>
          <View style={styles.sectionCol}>
            <Text style={styles.sectionLabel}>Van</Text>
            <Text style={[styles.sectionValue, styles.sectionStrong]}>{data.agency.name}</Text>
            {data.agency.address?.street && (
              <Text style={styles.sectionValue}>{data.agency.address.street}</Text>
            )}
            {data.agency.address && (
              <Text style={styles.sectionValue}>
                {[data.agency.address.postalCode, data.agency.address.city]
                  .filter(Boolean)
                  .join(" ")}
              </Text>
            )}
            {data.agency.kvk && (
              <Text style={styles.sectionValue}>KvK {data.agency.kvk}</Text>
            )}
            {data.agency.vatNumber && (
              <Text style={styles.sectionValue}>BTW {data.agency.vatNumber}</Text>
            )}
          </View>
          <View style={styles.sectionCol}>
            <Text style={styles.sectionLabel}>Aan</Text>
            <Text style={[styles.sectionValue, styles.sectionStrong]}>{data.client.name}</Text>
            <Text style={styles.sectionValue}>{data.client.email}</Text>
            {data.client.address && (
              <Text style={styles.sectionValue}>{data.client.address}</Text>
            )}
          </View>
          <View style={styles.sectionCol}>
            <Text style={styles.sectionLabel}>Datum</Text>
            <Text style={styles.sectionValue}>{data.issueDate}</Text>
            <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Vervalt</Text>
            <Text style={styles.sectionValue}>{data.dueDate}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.thLeft]}>Omschrijving</Text>
            <Text style={[styles.th, styles.thRight]}>Bedrag</Text>
          </View>
          {data.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tdDescription}>{item.description}</Text>
              <Text style={styles.tdAmount}>{eur(item.amountCents)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotaal</Text>
            <Text style={styles.totalValue}>{eur(data.subtotalCents)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>BTW {data.vatRate}%</Text>
            <Text style={styles.totalValue}>{eur(data.vatCents)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Totaal</Text>
            <Text style={styles.grandTotalValue}>{eur(data.totalCents)}</Text>
          </View>
        </View>

        {/* Payment */}
        {(data.paymentLink || data.paymentTerms) && (
          <View style={styles.paymentBlock}>
            <Text style={styles.paymentLabel}>Betaling</Text>
            {data.paymentTerms && (
              <Text style={styles.paymentTerms}>{data.paymentTerms}</Text>
            )}
            {data.paymentLink && (
              <Text style={[styles.paymentLink, { color: data.agency.primaryColor }]}>
                Betalen via iDEAL of kaart → {data.paymentLink.slice(0, 70)}...
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{data.agency.name}</Text>
          <Text>Gegenereerd door Willoe · {data.issueDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
