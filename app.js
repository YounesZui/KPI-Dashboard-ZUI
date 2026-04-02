/* ─── app.js – Dashboard Logic ─── */

/* ── State ── */
let activeIndex = 0; // which period is currently shown

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  render();
  buildEntryForm();
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

    // Sort: newest first
    KPI_DATA.sort((a, b) => b.period.localeCompare(a.period));
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
  const prev    = KPI_DATA[activeIndex + 1] ? { ...KPI_DATA[activeIndex + 1], kpis: enrichKpis(KPI_DATA[activeIndex + 1].kpis) } : null;
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
    const sparkData    = KPI_DATA.slice(activeIndex).map(d => d.kpis[key] ?? 0).reverse();

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
    const isActive = i === data.length - 1 - activeIndex;
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

  const keys = Object.keys(KPI_META);

  thead.innerHTML = `<tr>
    <th>Periode</th>
    ${keys.map(k => `<th>${KPI_META[k].label}</th>`).join('')}
  </tr>`;

  tbody.innerHTML = KPI_DATA.map((entry, i) => {
    const prev = KPI_DATA[i + 1] || null;
    const cells = keys.map(key => {
      const val     = entry.kpis[key];
      const prevVal = prev?.kpis[key];
      if (val === undefined) return `<td>–</td>`;

      let deltaHtml = '';
      if (prevVal !== undefined && prevVal !== null) {
        const delta = val - prevVal;
        const pct   = prevVal !== 0 ? (delta / Math.abs(prevVal) * 100) : 0;
        const better = KPI_META[key].trend === 'higher_better' ? delta > 0 : delta < 0;
        const cls    = better ? 'pos' : 'neg';
        const sign   = delta > 0 ? '+' : '';
        deltaHtml = `<span class="delta ${cls}">${sign}${pct.toFixed(1)}%</span>`;
      }

      return `<td>${formatValue(val, KPI_META[key])} ${deltaHtml}</td>`;
    }).join('');

    const activeClass = i === activeIndex ? ' class="active-row"' : '';
    return `<tr${activeClass}><td class="period-cell">${entry.label}</td>${cells}</tr>`;
  }).join('');
}

/* ── Entry Form ── */
function buildEntryForm() {
  const grid = document.getElementById('entry-form-grid');
  const keys = Object.keys(KPI_META);

  // Period field
  const today = new Date();
  const defaultPeriod = today.getDate() <= 15
    ? `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-01`
    : `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-15`;

  grid.innerHTML = `
    <div class="entry-field" style="grid-column: 1/-1">
      <label>📅 Datum der Periode</label>
      <input type="date" id="ef-period" value="${defaultPeriod}"/>
      <span class="hint">Immer 01. oder 15. des Monats</span>
    </div>
    <div class="entry-field" style="grid-column: 1/-1">
      <label>🏷 Anzeige-Label (optional)</label>
      <input type="text" id="ef-label" placeholder="z. B. Mai 25 · M1"/>
      <span class="hint">Leer lassen = automatisch generiert</span>
    </div>
    ${keys.map(key => {
      const meta = KPI_META[key];
      return `
        <div class="entry-field">
          <label>${meta.icon} ${meta.label}</label>
          <input type="number" id="ef-${key}" step="0.01" min="0"
                 placeholder="${meta.unit === '%' ? 'z. B. 3.5' : meta.unit === '€' ? 'z. B. 89.00' : meta.unit === 'x' ? 'z. B. 4.2' : 'z. B. 15000'}"/>
          <span class="hint">${meta.description}${meta.unit ? ' (in ' + meta.unit + ')' : ''}</span>
        </div>
      `;
    }).join('')}
  `;
}

function submitEntry() {
  const periodInput = document.getElementById('ef-period');
  const labelInput  = document.getElementById('ef-label');
  const period = periodInput.value;
  if (!period) { showToast('❌ Bitte ein Datum angeben.'); return; }

  const kpis = {};
  Object.keys(KPI_META).forEach(key => {
    const input = document.getElementById(`ef-${key}`);
    if (input && input.value !== '') {
      kpis[key] = parseFloat(input.value);
    }
  });

  if (Object.keys(kpis).length === 0) {
    showToast('❌ Bitte mindestens einen KPI-Wert eingeben.'); return;
  }

  // Auto-generate label from date if not provided
  const date  = new Date(period + 'T00:00:00');
  const month = date.toLocaleString('de-DE', { month: 'kurz' });
  const half  = date.getDate() <= 15 ? 'M1' : 'M2';
  const year  = String(date.getFullYear()).slice(2);
  const autoLabel = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year} · ${half}`;
  const label = labelInput.value.trim() || autoLabel;

  const entry = { period, label, kpis };

  const existingIdx = KPI_DATA.findIndex(d => d.period === period);
  if (existingIdx >= 0) {
    KPI_DATA[existingIdx] = entry;
    showToast('✅ Eintrag aktualisiert!');
  } else {
    KPI_DATA.unshift(entry);
    showToast('✅ Neuer Eintrag hinzugefügt!');
  }

  KPI_DATA.sort((a, b) => b.period.localeCompare(a.period));
  activeIndex = 0;
  saveToLocalStorage();
  render();
  clearForm();
  showExport();
}

function clearForm() {
  Object.keys(KPI_META).forEach(key => {
    const el = document.getElementById(`ef-${key}`);
    if (el) el.value = '';
  });
  const lbl = document.getElementById('ef-label');
  if (lbl) lbl.value = '';
}

function showExport() {
  const box = document.getElementById('export-box');
  const pre = document.getElementById('export-pre');
  box.classList.add('open');

  const latestEntry = KPI_DATA[0];
  const snippet = `  {\n    period: "${latestEntry.period}",\n    label: "${latestEntry.label}",\n    kpis: {\n${
    Object.entries(latestEntry.kpis).map(([k,v]) => `      ${k}: ${v}`).join(',\n')
  }\n    }\n  },`;
  pre.textContent = snippet;
}

function copyExport() {
  const pre = document.getElementById('export-pre');
  navigator.clipboard.writeText(pre.textContent)
    .then(() => showToast('📋 In Zwischenablage kopiert!'))
    .catch(() => showToast('Manuell kopieren (Ctrl+A im Code-Block)'));
}

function deleteCurrentPeriod() {
  if (KPI_DATA.length === 0) return;
  const label = KPI_DATA[activeIndex].label;
  if (!confirm(`Periode "${label}" wirklich löschen?`)) return;
  KPI_DATA.splice(activeIndex, 1);
  activeIndex = Math.max(0, activeIndex - 1);
  saveToLocalStorage();
  render();
  showToast('🗑 Eintrag gelöscht.');
}

/* ── UI helpers ── */
function toggleEntry() {
  const body    = document.getElementById('entry-body');
  const toggle  = document.getElementById('entry-toggle');
  const isOpen  = body.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
  toggle.textContent = isOpen ? '▲' : '▼';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function updateTimestamp() {
  const el = document.getElementById('last-updated');
  if (el) el.textContent = 'Zuletzt geöffnet: ' + new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
