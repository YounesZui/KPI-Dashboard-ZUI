// ============================================================
//  KPI DATEN – Alle 2 Wochen aktualisieren
//  Format: { period: "YYYY-MM-DD", label: "Anzeigename", kpis: { ... } }
//  Neue Einträge OBEN einfügen (neueste zuerst)
// ============================================================

const KPI_DATA = [
  // ── BEISPIELDATEN – durch echte Werte ersetzen ──
  {
    period: "2025-04-15",
    label: "Apr 25 · M2",
    kpis: {
      traffic:          18420,
      conversion_rate:  3.8,
      social_cr:        1.9,
      aov:              94.50,
      cart_abandon:     68.2,
      checkout_abandon: 24.1,
      returning:        38.5
    }
  },
  {
    period: "2025-04-01",
    label: "Apr 25 · M1",
    kpis: {
      traffic:          16850,
      conversion_rate:  3.5,
      social_cr:        1.7,
      aov:              89.00,
      cart_abandon:     70.4,
      checkout_abandon: 25.8,
      returning:        36.2
    }
  },
  {
    period: "2025-03-15",
    label: "Mär 25 · M2",
    kpis: {
      traffic:          15300,
      conversion_rate:  3.2,
      social_cr:        1.5,
      aov:              85.20,
      cart_abandon:     72.1,
      checkout_abandon: 27.3,
      returning:        34.8
    }
  },
  {
    period: "2025-03-01",
    label: "Mär 25 · M1",
    kpis: {
      traffic:          14100,
      conversion_rate:  3.0,
      social_cr:        1.4,
      aov:              82.00,
      cart_abandon:     73.5,
      checkout_abandon: 28.9,
      returning:        33.1
    }
  },
  {
    period: "2025-02-15",
    label: "Feb 25 · M2",
    kpis: {
      traffic:          13200,
      conversion_rate:  2.8,
      social_cr:        1.3,
      aov:              79.50,
      cart_abandon:     75.0,
      checkout_abandon: 30.2,
      returning:        31.0
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
    description: "Unique Besucher im Shop"
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
