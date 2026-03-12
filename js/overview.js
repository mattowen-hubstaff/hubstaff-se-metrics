// Overview tab

function renderOverview(weeklyMetrics, implementations, escalations) {
  const latest = weeklyMetrics.filter(w => w.escalations > 0 || w.calls > 0).slice(-1)[0] || {};
  const allEscalations = escalations.length;
  const resolvedBySE = escalations.filter(e => e.outcome === 'Resolved by SE').length;
  const avgDays = escalations.length
    ? (escalations.reduce((s, e) => s + (e.days_to_resolve || 0), 0) / escalations.length).toFixed(1)
    : '—';
  const activeImpl = implementations.filter(i => i.rag !== 'Green' || i.stage !== 'Stability').length;
  const latestCSAT = weeklyMetrics.filter(w => w.csat_score).slice(-1)[0]?.csat_score || '—';

  document.getElementById('overview-content').innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Escalations</div>
        <div class="kpi-value">${allEscalations}</div>
        <div class="kpi-sub">${resolvedBySE} resolved by SE</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg. Days to Resolve</div>
        <div class="kpi-value">${avgDays}</div>
        <div class="kpi-sub">across all escalations</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Active Implementations</div>
        <div class="kpi-value">${activeImpl}</div>
        <div class="kpi-sub">in progress</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Latest CSAT</div>
        <div class="kpi-value">${latestCSAT !== '—' ? latestCSAT + '/5' : '—'}</div>
        <div class="kpi-sub">most recent week</div>
      </div>
    </div>
    <div class="section-title">Time Distribution — This Week vs. Target</div>
    <div class="time-bars">
      ${renderTimeBar('Escalations & Investigations', latest.time_escalations || 0, TIME_TARGETS.escalations)}
      ${renderTimeBar('Calls', latest.time_calls || 0, TIME_TARGETS.calls)}
      ${renderTimeBar('Documentation', latest.time_docs || 0, TIME_TARGETS.docs)}
      ${renderTimeBar('Cross-team Async', latest.time_async || 0, TIME_TARGETS.async)}
      ${renderTimeBar('Special Projects', latest.time_projects || 0, TIME_TARGETS.projects)}
    </div>
    <div class="phase-badge">📊 Phase 1 — Establishing Baseline</div>
  `;
}

function renderTimeBar(label, actual, target) {
  const pct = Math.min(actual, 100);
  const diff = actual - target;
  const diffStr = diff === 0 ? 'on target' : (diff > 0 ? `+${diff}%` : `${diff}%`);
  const diffClass = diff > 5 ? 'over' : diff < -5 ? 'under' : 'on-target';
  return `
    <div class="time-bar-row">
      <div class="time-bar-label">${label}</div>
      <div class="time-bar-track">
        <div class="time-bar-fill" style="width:${pct}%"></div>
        <div class="time-bar-target" style="left:${target}%"></div>
      </div>
      <div class="time-bar-stats">
        <span class="actual">${actual}%</span>
        <span class="diff ${diffClass}">${diffStr}</span>
      </div>
    </div>
  `;
}
