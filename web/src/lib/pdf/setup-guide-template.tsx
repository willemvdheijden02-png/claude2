import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import type { Block, Section } from "./setup-guide-data";

const ACCENT = "#10b981";
const TEXT_PRIMARY = "#0a0a0a";
const TEXT_SECONDARY = "#404040";
const TEXT_TERTIARY = "#737373";
const BORDER = "#e5e5e5";
const BG_SOFT = "#f5f5f5";

const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: TEXT_PRIMARY,
    backgroundColor: "#ffffff",
  },
  // Cover
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  coverInner: {
    flex: 1,
    padding: 56,
    justifyContent: "space-between",
  },
  coverBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  coverSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  coverSquareText: { color: "#ffffff", fontSize: 18, fontFamily: "Helvetica-Bold" },
  coverBrandName: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  coverTitleBlock: { marginTop: 220 },
  coverTitle: {
    fontSize: 40,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -1,
    lineHeight: 1.05,
    color: TEXT_PRIMARY,
  },
  coverSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 14,
    maxWidth: 380,
    lineHeight: 1.5,
  },
  coverMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  coverMetaLabel: {
    fontSize: 9,
    color: TEXT_TERTIARY,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  coverMetaValue: { fontSize: 11, color: TEXT_PRIMARY, marginTop: 2 },

  // TOC
  tocTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  tocItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tocItemText: { fontSize: 11, color: TEXT_PRIMARY, flex: 1 },
  tocItemPage: { fontSize: 10, color: TEXT_TERTIARY },

  // Section
  sectionHeader: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.3,
    marginBottom: 16,
    color: TEXT_PRIMARY,
  },

  // Blocks
  h2: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 8 },
  h3: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 6 },
  p: { fontSize: 10.5, lineHeight: 1.55, color: TEXT_SECONDARY, marginBottom: 8 },
  listItem: { flexDirection: "row", marginBottom: 4 },
  listBullet: { width: 14, fontSize: 10.5, color: TEXT_TERTIARY },
  listText: { flex: 1, fontSize: 10.5, lineHeight: 1.55, color: TEXT_SECONDARY },
  code: {
    fontFamily: "Courier",
    fontSize: 9,
    backgroundColor: BG_SOFT,
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
  },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    marginVertical: 8,
    overflow: "hidden",
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowLast: { flexDirection: "row" },
  tableHeader: { backgroundColor: BG_SOFT, fontFamily: "Helvetica-Bold" },
  tableCell: {
    padding: 8,
    fontSize: 9,
    flex: 1,
    color: TEXT_PRIMARY,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  tableCellLast: { padding: 8, fontSize: 9, flex: 1, color: TEXT_PRIMARY },

  // Callout
  calloutInfo: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
    padding: 10,
    marginVertical: 8,
    borderRadius: 3,
  },
  calloutWarning: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    padding: 10,
    marginVertical: 8,
    borderRadius: 3,
  },
  calloutSuccess: {
    backgroundColor: "#d1fae5",
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
    padding: 10,
    marginVertical: 8,
    borderRadius: 3,
  },
  calloutText: { fontSize: 9.5, lineHeight: 1.55, color: TEXT_PRIMARY },

  divider: {
    marginVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  // Link & video blocks
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    marginVertical: 4,
    backgroundColor: "#fafafa",
  },
  linkIcon: {
    width: 20,
    fontSize: 12,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
  },
  linkLabel: {
    flex: 1,
    fontSize: 10.5,
    color: TEXT_PRIMARY,
    fontFamily: "Helvetica-Bold",
  },
  linkUrl: {
    fontSize: 9,
    color: ACCENT,
    fontFamily: "Courier",
  },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 6,
    marginVertical: 4,
    backgroundColor: "#fef2f2",
  },
  videoIcon: {
    width: 28,
    fontSize: 11,
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
  },
  videoCol: { flex: 1 },
  videoTitle: { fontSize: 10.5, color: TEXT_PRIMARY, marginBottom: 2 },
  videoUrl: { fontSize: 9, color: "#dc2626", fontFamily: "Courier" },

  // Page chrome
  pageHeader: {
    position: "absolute",
    top: 24,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: TEXT_TERTIARY,
  },
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: TEXT_TERTIARY,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
});

function renderBlock(block: Block, key: number): React.ReactElement | null {
  switch (block.type) {
    case "h1":
      return <Text key={key} style={s.sectionHeader}>{block.text}</Text>;
    case "h2":
      return <Text key={key} style={s.h2}>{block.text}</Text>;
    case "h3":
      return <Text key={key} style={s.h3}>{block.text}</Text>;
    case "p":
      return <Text key={key} style={s.p}>{block.text}</Text>;
    case "ul":
      return (
        <View key={key} style={{ marginVertical: 4 }}>
          {block.items.map((item, i) => (
            <View key={i} style={s.listItem}>
              <Text style={s.listBullet}>•</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case "ol":
      return (
        <View key={key} style={{ marginVertical: 4 }}>
          {block.items.map((item, i) => (
            <View key={i} style={s.listItem}>
              <Text style={s.listBullet}>{i + 1}.</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case "code":
      return <Text key={key} style={s.code}>{block.text}</Text>;
    case "table":
      return (
        <View key={key} style={s.table}>
          <View style={[s.tableRow, s.tableHeader]}>
            {block.head.map((h, i) => (
              <Text key={i} style={i === block.head.length - 1 ? s.tableCellLast : s.tableCell}>
                {h}
              </Text>
            ))}
          </View>
          {block.rows.map((row, i) => (
            <View
              key={i}
              style={i === block.rows.length - 1 ? s.tableRowLast : s.tableRow}
            >
              {row.map((cell, j) => (
                <Text key={j} style={j === row.length - 1 ? s.tableCellLast : s.tableCell}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    case "callout": {
      const style =
        block.tone === "warning"
          ? s.calloutWarning
          : block.tone === "success"
          ? s.calloutSuccess
          : s.calloutInfo;
      return (
        <View key={key} style={style}>
          <Text style={s.calloutText}>{block.text}</Text>
        </View>
      );
    }
    case "link":
      return (
        <Link key={key} src={block.url} style={s.linkRow}>
          <Text style={s.linkIcon}>→</Text>
          <View style={s.videoCol}>
            <Text style={s.linkLabel}>{block.label}</Text>
            <Text style={s.linkUrl}>{block.url}</Text>
          </View>
        </Link>
      );
    case "video":
      return (
        <Link key={key} src={block.url} style={s.videoRow}>
          <Text style={s.videoIcon}>▶</Text>
          <View style={s.videoCol}>
            <Text style={s.videoTitle}>{block.title}</Text>
            <Text style={s.videoUrl}>{block.url}</Text>
          </View>
        </Link>
      );
    case "divider":
      return <View key={key} style={s.divider} />;
    default:
      return null;
  }
}

export function SetupGuidePdf({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: Section[];
}) {
  const today = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={title} author="Willoe" creator="Willoe">
      {/* Cover */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverInner}>
          <View style={s.coverBrand}>
            <View style={s.coverSquare}>
              <Text style={s.coverSquareText}>W</Text>
            </View>
            <Text style={s.coverBrandName}>willoe</Text>
          </View>

          <View style={s.coverTitleBlock}>
            <Text style={s.coverTitle}>{title}</Text>
            <Text style={s.coverSubtitle}>{subtitle}</Text>
          </View>

          <View style={s.coverMeta}>
            <View>
              <Text style={s.coverMetaLabel}>Versie</Text>
              <Text style={s.coverMetaValue}>v1.0</Text>
            </View>
            <View>
              <Text style={s.coverMetaLabel}>Gegenereerd</Text>
              <Text style={s.coverMetaValue}>{today}</Text>
            </View>
            <View>
              <Text style={s.coverMetaLabel}>Tijdsindicatie</Text>
              <Text style={s.coverMetaValue}>~90 min volledige setup</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Table of Contents */}
      <Page size="A4" style={s.page}>
        <View style={s.pageHeader} fixed>
          <Text>{title}</Text>
          <Text>v1.0 · {today}</Text>
        </View>
        <Text style={s.tocTitle}>Inhoudsopgave</Text>
        {sections.map((section, i) => (
          <View key={i} style={s.tocItem}>
            <Text style={s.tocItemText}>
              {i + 1}. {section.title}
            </Text>
            <Text style={s.tocItemPage}>—</Text>
          </View>
        ))}
        <View style={s.pageFooter} fixed>
          <Text>willoe.com</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* Content */}
      <Page size="A4" style={s.page}>
        <View style={s.pageHeader} fixed>
          <Text>{title}</Text>
          <Text>v1.0 · {today}</Text>
        </View>

        {sections.map((section, sIdx) => (
          <View key={sIdx} break={sIdx > 0}>
            <Text style={s.sectionHeader}>
              {sIdx + 1}. {section.title}
            </Text>
            {section.blocks.map((block, bIdx) => renderBlock(block, bIdx))}
          </View>
        ))}

        <View style={s.pageFooter} fixed>
          <Text>willoe.com</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
