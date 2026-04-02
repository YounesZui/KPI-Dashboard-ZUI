/* ─── app.js – Dashboard Logic ─── */

/* ── State ── */
let activeIndex = KPI_DATA.length - 1;

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  render();
});

/* ── localStorage: merge saved data on top of bundled data ── */
function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('kpi_entries');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return;

    // Merge: saved entries override bundled ones with the same period
    const bundledPeriods = new Set(KPI_DATA.map(d => d.period));
    parsed.forEach(entry => {
      const idx = KPI_DATA.findIndex(d => d.period === entry.period);
      if (idx >= 0) {
        KPI_DATA[idx] = entry; // overwrite
      } else {
        KPI_DATA.push(entry);
      }
    });

    // Sort: oldest first
    KPI_DATA.sort((a, b) => a.period.localeCompare(b.period));
    activeIndex = KPI_DATA.length - 1;
  } catch(e) {
    console.warn('LocalStorage parse error:', e);
  }
}

function saveToLocalStorage() {
  try {
    // Only save entries that differ from or extend the bundled set
    localStorage.setItem('kpi_entries', JSON.stringify(KPI_DATA));
  } catch(e) {
    console.warn('LocalStorage save error:', e);
  }
}

/* ── Main Render ── */
function render() {
  if (!KPI_DATA.length) {
    document.getElementById('main-content').innerHTML =
      '<div class="no-data">Noch keine Daten vorhanden. Nutze das Formular unten um den ersten Eintrag hinzuzufügen.</div>';
    return;
  }

  // Clamp activeIndex
  activeIndex = Math.max(0, Math.min(activeIndex, KPI_DATA.length - 1));

  renderPeriodTabs();
  renderKpiCards();
  renderCharts();
  renderTable();
  updateTimestamp();
}

/* ── Period Tabs ── */
function renderPeriodTabs() {
  const container = document.getElementById('period-tabs');
  container.innerHTML = '';
  KPI_DATA.forEach((entry, i) => {
    const btn = document.createElement('button');
    btn.className = 'period-tab' + (i === activeIndex ? ' active' : '');
    btn.textContent = entry.label;
    btn.onclick = () => { activeIndex = i; render(); };
    container.appendChild(btn);
  });
}

/* ── KPI Cards ── */
function renderKpiCards() {
  const current = { ...KPI_DATA[activeIndex], kpis: enrichKpis(KPI_DATA[activeIndex].kpis) };
  const prev    = KPI_DATA[activeIndex - 1] ? { ...KPI_DATA[activeIndex - 1], kpis: enrichKpis(KPI_DATA[activeIndex - 1].kpis) } : null;
  const container = document.getElementById('kpi-grid');
  container.innerHTML = '';

  Object.keys(KPI_META).forEach(key => {
    const meta = KPI_META[key];
    const val  = current.kpis[key];
    if (val === undefined || val === null) return;

    const prevVal  = prev ? prev.kpis[key] : null;
    const deltaRaw = prevVal !== null ? val - prevVal : null;
    const deltaPct = (prevVal && prevVal !== 0) ? ((val - prevVal) / Math.abs(prevVal) * 100) : null;

    const betterIsHigher = meta.trend === 'higher_better';
    let trendClass = 'neutral', trendIcon = '—';
    if (deltaRaw !== null && deltaRaw !== 0) {
      const isPositive = deltaRaw > 0;
      const isGood = betterIsHigher ? isPositive : !isPositive;
      trendClass = isGood ? 'up' : 'down';
      trendIcon  = isPositive ? '↑' : '↓';
    }

    const formattedVal = formatValue(val, meta);
    const sparkData    = KPI_DATA.slice(0, activeIndex + 1).map(d => d.kpis[key] ?? 0);

    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.innerHTML = `
      <div class="kpi-card-top">
        <div class="kpi-icon-label">
          <span class="kpi-icon">${meta.icon}</span>
          <span class="kpi-label">${meta.label}</span>
        </div>
        ${deltaRaw !== null && deltaRaw !== 0 ? `
        <span class="kpi-trend ${trendClass}">
          ${trendIcon} ${deltaPct !== null ? Math.abs(deltaPct).toFixed(1) + '%' : ''}
        </span>` : '<span class="kpi-trend neutral">—</span>'}
      </div>
      <div class="kpi-value">${formattedVal}</div>
      <svg class="kpi-sparkline" viewBox="0 0 200 40" preserveAspectRatio="none">
        ${buildSparkline(sparkData, trendClass)}
      </svg>
      <div class="kpi-desc">${meta.description}</div>
    `;
    container.appendChild(card);
  });
}

/* ── Sparkline ── */
function buildSparkline(data, trendClass) {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 200;
    const y = 38 - ((v - min) / range) * 34;
    return `${x},${y}`;
  });

  const color = trendClass === 'up' ? '#1a7a4a' : trendClass === 'down' ? '#c0392b' : '#aaaaaa';
  const polyline = pts.join(' ');
  const area = `${pts[0].split(',')[0]},40 ${polyline} ${pts[pts.length-1].split(',')[0]},40`;

  return `
    <defs>
      <linearGradient id="sg_${Math.random().toString(36).slice(2)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${area}" fill="url(#sg_${Math.random().toString(36).slice(2)})" />
    <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="3" fill="${color}"/>
  `;
}

/* ── Charts ── */
function renderCharts() {
  const container = document.getElementById('charts-grid');
  container.innerHTML = '';

  const chartKeys = ['traffic', 'conversion_rate', 'aov', 'cart_abandon'];
  chartKeys.forEach(key => {
    if (!KPI_META[key]) return;
    const meta   = KPI_META[key];
    const allVals = [...KPI_DATA].reverse().map(d => ({ label: d.label, val: d.kpis[key] ?? 0 }));

    const card = document.createElement('div');
    card.className = 'chart-card';
    card.innerHTML = `
      <div class="chart-card-title">${meta.icon} ${meta.label} – Verlauf</div>
      <div class="chart-area">${buildBarChart(allVals, meta, activeIndex === 0)}</div>
    `;
    container.appendChild(card);
  });
}

function buildBarChart(data, meta, _latest) {
  if (!data.length) return '';
  const W = 400, H = 160, padL = 45, padB = 22, padT = 10, padR = 10;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const vals  = data.map(d => d.val);
  const max   = Math.max(...vals) * 1.15 || 1;
  const min   = 0;
  const barW  = Math.max(8, (innerW / data.length) - 6);
  const color = '#cccccc';
  const colorHi = '#e8540a';

  const bars = data.map((d, i) => {
    const bH = ((d.val - min) / (max - min)) * innerH;
    const x  = padL + i * (innerW / data.length) + (innerW / data.length - barW) / 2;
    const y  = padT + innerH - bH;
    const isActive = i === activeIndex;
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${bH}"
            fill="${isActive ? colorHi : color}" rx="3" opacity="${isActive ? 1 : 0.55}"/>
    `;
  }).join('');

  // Y-axis ticks
  const ticks = [0, 0.5, 1].map(t => {
    const yPos = padT + innerH - t * innerH;
    const val  = min + t * (max - min);
    return `
      <line x1="${padL}" y1="${yPos}" x2="${W - padR}" y2="${yPos}" stroke="#e8e8e8" stroke-width="1"/>
      <text x="${padL - 5}" y="${yPos + 4}" fill="#aaaaaa" font-size="9" text-anchor="end">${formatShort(val, meta)}</text>
    `;
  }).join('');

  // X labels (every 2nd to avoid overlap)
  const xLabels = data.map((d, i) => {
    if (data.length > 5 && i % 2 !== 0) return '';
    const x = padL + i * (innerW / data.length) + (innerW / data.length) / 2;
    const label = d.label.split('·')[1]?.trim() || d.label;
    return `<text x="${x}" y="${H - 4}" fill="#aaaaaa" font-size="8" text-anchor="middle">${label}</text>`;
  }).join('');

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${ticks}${bars}${xLabels}
  </svg>`;
}

/* ── History Table ── */
function renderTable() {
  const thead = document.getElementById('table-head');
  const tbody = document.getElementById('table-body');
  const keys  = Object.keys(KPI_META);

  // Which KPIs are summed vs. averaged in the totals row
  const sumKeys     = ['traffic', 'revenue'];
  const avgKeys     = ['conversion_rate', 'social_cr', 'aov', 'rps', 'cart_abandon', 'checkout_abandon', 'returning'];

  thead.innerHTML = `<tr>
    <th>Periode</th>
    ${keys.map(k => `<th>${KPI_META[k].label}</th>`).join('')}
  </tr>`;

  // Regular rows
  const rows = KPI_DATA.map((entry, i) => {
    const enriched = enrichKpis(entry.kpis);
    const prev     = KPI_DATA[i - 1] ? enrichKpis(KPI_DATA[i - 1].kpis) : null;

    const cells = keys.map(key => {
      const val     = enriched[key];
      const prevVal = prev ? prev[key] : null;
      if (val === undefined || val === null) return `<td>–</td>`;

      let deltaHtml = '';
      if (prevVal !== undefined && prevVal !== null) {
        const delta  = val - prevVal;
        const pct    = prevVal !== 0 ? (delta / Math.abs(prevVal) * 100) : 0;
        const better = KPI_META[key].trend === 'higher_better' ? delta > 0 : delta < 0;
        const cls    = better ? 'pos' : 'neg';
        const sign   = delta > 0 ? '+' : '';
        deltaHtml    = `<span class="delta ${cls}">${sign}${pct.toFixed(1)}%</span>`;
      }
      return `<td>${formatValue(val, KPI_META[key])} ${deltaHtml}</td>`;
    }).join('');

    const activeClass = i === activeIndex ? ' class="active-row"' : '';
    return `<tr${activeClass}><td class="period-cell">${entry.label}</td>${cells}</tr>`;
  }).join('');

  // Totals row
  const totalCells = keys.map(key => {
    const meta   = KPI_META[key];
    const values = KPI_DATA
      .map(d => enrichKpis(d.kpis)[key])
      .filter(v => v !== null && v !== undefined);

    if (!values.length) return `<td class="total-cell">–</td>`;

    let total;
    if (sumKeys.includes(key)) {
      total = values.reduce((a, b) => a + b, 0);
    } else if (avgKeys.includes(key)) {
      total = values.reduce((a, b) => a + b, 0) / values.length;
    } else {
      return `<td class="total-cell">–</td>`;
    }

    return `<td class="total-cell">${formatValue(total, meta)}</td>`;
  }).join('');

  const year = KPI_DATA.length
    ? new Date(KPI_DATA[0].period).getFullYear()
    : new Date().getFullYear();

  tbody.innerHTML = rows + `
    <tr class="total-row">
      <td class="total-label">${year} · Gesamt</td>
      ${totalCells}
    </tr>`;
}

/* ── UI helpers ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function updateTimestamp() {
  const el = document.getElementById('last-updated');
  if (el) el.textContent = 'Stand: ' + new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

/* ── Auto-calculate derived KPIs ── */
function enrichKpis(kpis) {
  const k = Object.assign({}, kpis);
  // RPS: Revenue per Session – auto if revenue + traffic available
  if (k.rps === null && k.revenue !== null && k.traffic) {
    k.rps = k.revenue / k.traffic;
  }
  return k;
}

/* ── Formatters ── */
function formatValue(val, meta) {
  if (val === undefined || val === null) return '–';
  switch (meta.format) {
    case 'currency': return `<span class="unit-prefix">€</span>${val.toLocaleString('de-DE', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    case 'percent':  return `${val.toLocaleString('de-DE', {minimumFractionDigits:1, maximumFractionDigits:1})}<span class="unit">%</span>`;
    case 'number':   return val.toLocaleString('de-DE');
    case 'roas':     return `${val.toLocaleString('de-DE', {minimumFractionDigits:1, maximumFractionDigits:1})}<span class="unit">x</span>`;
    default:         return String(val);
  }
}

function formatShort(val, meta) {
  if (meta.format === 'currency') return '€' + (val >= 1000 ? (val/1000).toFixed(1)+'k' : val.toFixed(0));
  if (meta.format === 'percent')  return val.toFixed(1) + '%';
  if (meta.format === 'roas')     return val.toFixed(1) + 'x';
  if (val >= 1000000) return (val/1000000).toFixed(1) + 'M';
  if (val >= 1000)    return (val/1000).toFixed(1) + 'k';
  return val.toFixed(0);
}
