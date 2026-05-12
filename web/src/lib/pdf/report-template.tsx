import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type ReportPdfData = {
  title: string; // bv "Wekelijks rapport — Bol BH's"
  period: string; // bv "Week 19 (5-11 mei 2026)"
  generatedDate: string;
  agency: {
    name: string;
    primaryColor: string;
  };
  client: {
    name: string;
  };
  /** Markdown-style content, geparsed naar secties */
  sections: { heading: string; body: string }[];
  kpis?: { label: string; value: string; delta?: string }[];
};

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
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  brandBlock: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandSquare: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  brandSquareText: { color: "#ffffff", fontSize: 14, fontFamily: "Helvetica-Bold" },
  brandName: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  metaRight: { textAlign: "right" },
  metaLabel: {
    fontSize: 8,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: { fontSize: 10, color: "#525252", marginTop: 2 },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 12, color: "#525252", marginBottom: 28 },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 32,
  },
  kpiCard: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
  },
  kpiLabel: {
    fontSize: 8,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kpiValue: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4 },
  kpiDelta: { fontSize: 9, color: "#737373", marginTop: 2 },
  section: { marginBottom: 22 },
  sectionHeading: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#0a0a0a",
  },
  sectionBody: { fontSize: 11, lineHeight: 1.55, color: "#262626" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#a3a3a3",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 8,
  },
});

export function ReportPdf({ data }: { data: ReportPdfData }) {
  return (
    <Document title={data.title} author={data.agency.name} creator="Willoe">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <View style={[styles.brandSquare, { backgroundColor: data.agency.primaryColor }]}>
              <Text style={styles.brandSquareText}>
                {data.agency.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.brandName}>{data.agency.name}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaLabel}>Rapport voor</Text>
            <Text style={styles.metaValue}>{data.client.name}</Text>
          </View>
        </View>

        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>{data.period}</Text>

        {data.kpis && data.kpis.length > 0 && (
          <View style={styles.kpiGrid}>
            {data.kpis.map((kpi) => (
              <View key={kpi.label} style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                {kpi.delta && <Text style={styles.kpiDelta}>{kpi.delta}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.sections.map((section, i) => (
          <View key={i} style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>{data.agency.name} · {data.client.name}</Text>
          <Text>Gegenereerd door Willoe · {data.generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
