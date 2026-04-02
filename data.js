// ============================================================
//  KPI DATEN – Alle 2 Wochen aktualisieren
//  Format: { period: "YYYY-MM-DD", label: "Anzeigename", kpis: { ... } }
//  Neue Einträge OBEN einfügen (neueste zuerst)
// ============================================================

const KPI_DATA = [
  {
    period: "2026-03-01",
    label: "Mär 26 · Gesamt",
    kpis: {
      // ── Traffic & Conversion ──
      traffic:          11567,
      conversion_rate:  1.24,
      social_cr:        0,
      // ── Umsatz ──
      aov:              270.41,
      revenue:          null,   // Gesamtumsatz März in € → fehlt noch
      rps:              null,   // Umsatz pro Session → wird auto berechnet wenn revenue da
      // ── Funnel ──
      cart_abandon:     46.0,
      checkout_abandon: 43.0,
      // ── Kunden ──
      returning:        23.7,
      // ── Marketing-Effizienz ──
      roas:             null,   // Return on Ad Spend → fehlt noch
      cac:              null    // Cost per Acquired Customer → fehlt noch
    }
  }
];

// Metadaten für jede KPI
const KPI_META = {
  traffic: {
    label: "Shop Traffic",
    icon: "👥",
    unit: "",
    format: "number",
    trend: "higher_better",
    description: "Sessions im Shop"
  },
  conversion_rate: {
    label: "Conversion Rate",
    icon: "🎯",
    unit: "%",
    format: "percent",
    trend: "higher_better",
    description: "Allgemeine Conversion Rate"
  },
  social_cr: {
    label: "Social CR",
    icon: "📲",
    unit: "%",
    format: "percent",
    trend: "higher_better",
    description: "Conversion Rate via Social Media"
  },
  aov: {
    label: "Ø Bestellwert",
    icon: "💶",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Average Order Value (AOV)"
  },
  revenue: {
    label: "Gesamtumsatz",
    icon: "💰",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Gesamtumsatz im Zeitraum"
  },
  rps: {
    label: "Umsatz / Session",
    icon: "📈",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Revenue per Session (RPS)"
  },
  cart_abandon: {
    label: "Warenkorb-Abbruch",
    icon: "🛒",
    unit: "%",
    format: "percent",
    trend: "lower_better",
    description: "Warenkorb-Abbruchrate"
  },
  checkout_abandon: {
    label: "Checkout-Abbruch",
    icon: "💳",
    unit: "%",
    format: "percent",
    trend: "lower_better",
    description: "Checkout-Abbruchrate"
  },
  returning: {
    label: "Wiederkehrende Kunden",
    icon: "🔁",
    unit: "%",
    format: "percent",
    trend: "higher_better",
    description: "Anteil wiederkehrender Kunden"
  },
  roas: {
    label: "ROAS",
    icon: "📣",
    unit: "x",
    format: "roas",
    trend: "higher_better",
    description: "Return on Ad Spend"
  },
  cac: {
    label: "Kundenakquise-Kosten",
    icon: "🎯",
    unit: "€",
    format: "currency",
    trend: "lower_better",
    description: "Cost per Acquired Customer (CAC)"
  }
};
