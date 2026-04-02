// ============================================================
//  KPI DATEN – Alle 2 Wochen aktualisieren
//  Format: { period: "YYYY-MM-DD", label: "Anzeigename", kpis: { ... } }
//  Neue Einträge OBEN einfügen (neueste zuerst)
// ============================================================

const KPI_DATA = [
  {
    period: "2026-01-01",
    label: "Jan 26 · Gesamt",
    kpis: {
      traffic:          12427,
      conversion_rate:  0.81,
      social_cr:        null,
      revenue:          24953.45,
      rps:              null,
      aov:              162.00,
      cart_abandon:     30.6,
      checkout_abandon: 54.1,
      returning:        34.97
    }
  },
  {
    period: "2026-02-01",
    label: "Feb 26 · Gesamt",
    kpis: {
      traffic:          11960,
      conversion_rate:  0.59,
      social_cr:        null,
      revenue:          23620.19,
      rps:              null,
      aov:              197.00,
      cart_abandon:     44.7,
      checkout_abandon: 54.5,
      returning:        36.4
    }
  },
  {
    period: "2026-03-01",
    label: "Mär 26 · Gesamt",
    kpis: {
      traffic:          11567,
      conversion_rate:  1.24,
      social_cr:        0,
      revenue:          47778.68,
      rps:              null,
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
  revenue: {
    label: "Gesamtumsatz",
    icon: "💰",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Gesamtumsatz im Zeitraum"
  },
  aov: {
    label: "Ø Bestellwert",
    icon: "💶",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Average Order Value (AOV)"
  },
  rps: {
    label: "Umsatz / Session",
    icon: "📈",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Revenue per Session (RPS) – auto berechnet"
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
