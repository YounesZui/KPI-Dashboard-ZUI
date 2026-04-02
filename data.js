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
      traffic:          11567,
      conversion_rate:  1.24,
      social_cr:        0,
      aov:              270.41,
      cart_abandon:     46.0,
      checkout_abandon: 43.0,
      returning:        23.7
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
  }
};
