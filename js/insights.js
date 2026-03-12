// Insights tab — org and type breakdown

let _selectedOrg = null;

function renderInsights(escalations) {
  const orgs = getOrgStats(escalations);
  const types = getTypeStats(escalations);

  document.getElementById('insights-content').innerHTML = `
    <div class="insights-layout">
      <div class="insights-sidebar">
        <div class="section-title">Organisations</div>
        <div class="org-list">
          <div class="org-item ${_selectedOrg === null ? 'active' : ''}" onclick="selectOrg(null)">
            <span class="org-name">All Organisations</span>
            <span class="org-count">${escalations.length}</span>
          </div>
          ${orgs.map(o => `
            <div class="org-item ${_selectedOrg === o.name ? 'active' : ''}" onclick="selectOrg('${o.name.replace(/'/g, "\\'")}')">
              <span class="org-name">${o.name}</span>
              <span class="org-count">${o.total}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="insights-main" id="insights-detail">
        ${renderInsightDetail(escalations, orgs, types, _selectedOrg)}
      </div>
    </div>
  `;
}

function selectOrg(org) {
  _selectedOrg = org;
  const escalations = window._escalations;
  const orgs = getOrgStats(escalations);
  const types = getTypeStats(escalations);

  // Update sidebar active state
  document.querySelectorAll('.org-item').forEach(el => el.classList.remove('active'));
  const items = document.querySelectorAll('.org-item');
  items.forEach(el => {
    const name = el.querySelector('.org-name').textContent;
    if ((org === null && name === 'All Organisations') || name === org) {
      el.classList.add('active');
    }
  });

  document.getElementById('insights-detail').innerHTML = renderInsightDetail(escalations, orgs, types, org);
}

function renderInsightDetail(escalations, orgs, types, selectedOrg) {
  const filtered = selectedOrg ? escalations.filter(e => e.org === selectedOrg) : escalations;

  if (filtered.length === 0) {
    return `<div class="empty-state">No escalations logged yet.</div>`;
  }

  const resolved = filtered.filter(e => e.outcome === 'Resolved by SE').length;
  const toEng = filtered.filter(e => e.outcome === 'Escalated to Engineering').length;
  const pending = filtered.filter(e => e.outcome === 'Pending').length;
  const withDays = filtered.filter(e => e.days_to_resolve);
  const avgDays = withDays.length
    ? (withDays.reduce((s, e) => s + e.days_to_resolve, 0) / withDays.length).toFixed(1)
    : '—';

  const filteredTypes = getTypeStats(filtered);
  const maxTypeCount = Math.max(...filteredTypes.map(t => t.total), 1);

  return `
    <div class="insight-header">
      <div class="insight-title">${selectedOrg || 'All Organisations'}</div>
      ${selectedOrg ? `<div class="insight-sub">${filtered.length} escalation${filtered.length !== 1 ? 's' : ''} total</div>` : ''}
    </div>

    <div class="insight-kpis">
      <div class="kpi-card">
        <div class="kpi-label">Total Escalations</div>
        <div class="kpi-value">${filtered.length}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Resolved by SE</div>
        <div class="kpi-value" style="color:var(--green)">${resolved}</div>
        <div class="kpi-sub">${filtered.length ? Math.round(resolved / filtered.length * 100) : 0}% resolution rate</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">To Engineering</div>
        <div class="kpi-value" style="color:var(--amber)">${toEng}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg. Days to Resolve</div>
        <div class="kpi-value">${avgDays}</div>
      </div>
    </div>

    <div class="section-title" style="margin-top:24px">Escalation Types</div>
    <div class="type-bars">
      ${filteredTypes.map(t => `
        <div class="type-bar-row">
          <div class="type-bar-label">${t.name}</div>
          <div class="type-bar-track">
            <div class="type-bar-fill" style="width:${Math.round(t.total / maxTypeCount * 100)}%"></div>
          </div>
          <div class="type-bar-count">${t.total}</div>
        </div>
      `).join('')}
    </div>

    ${selectedOrg ? `
      <div class="section-title" style="margin-top:24px">Escalation History</div>
      <table class="data-table">
        <thead><tr>
          <th>Date</th><th>Type</th><th>Outcome</th><th>Days</th><th>Notes</th>
        </tr></thead>
        <tbody>
          ${filtered.map(e => `
            <tr>
              <td>${e.date || '—'}</td>
              <td><span class="tag">${e.type}</span></td>
              <td><span class="outcome ${e.outcome.toLowerCase().replace(/ /g,'-')}">${e.outcome}</span></td>
              <td>${e.days_to_resolve ?? '—'}</td>
              <td class="notes-cell">${e.notes || '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    ` : `
      <div class="section-title" style="margin-top:24px">Org Breakdown</div>
      <table class="data-table">
        <thead><tr>
          <th>Organisation</th><th>Total</th><th>Resolved by SE</th><th>To Engineering</th><th>Avg Days</th><th>Top Type</th>
        </tr></thead>
        <tbody>
          ${orgs.map(o => `
            <tr class="clickable-row" onclick="selectOrg('${o.name.replace(/'/g, "\\'")}')">
              <td><span style="color:var(--blue);cursor:pointer">${o.name}</span></td>
              <td>${o.total}</td>
              <td style="color:var(--green)">${o.resolved}</td>
              <td style="color:var(--amber)">${o.toEng}</td>
              <td>${o.avgDays}</td>
              <td><span class="tag">${o.topType}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    `}
  `;
}

function getOrgStats(escalations) {
  const map = {};
  escalations.forEach(e => {
    if (!e.org) return;
    if (!map[e.org]) map[e.org] = { name: e.org, total: 0, resolved: 0, toEng: 0, types: {} };
    map[e.org].total++;
    if (e.outcome === 'Resolved by SE') map[e.org].resolved++;
    if (e.outcome === 'Escalated to Engineering') map[e.org].toEng++;
    map[e.org].types[e.type] = (map[e.org].types[e.type] || 0) + 1;
  });

  return Object.values(map).map(o => {
    const withDays = escalations.filter(e => e.org === o.name && e.days_to_resolve);
    o.avgDays = withDays.length
      ? (withDays.reduce((s, e) => s + e.days_to_resolve, 0) / withDays.length).toFixed(1)
      : '—';
    o.topType = Object.entries(o.types).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return o;
  }).sort((a, b) => b.total - a.total);
}

function getTypeStats(escalations) {
  const map = {};
  escalations.forEach(e => {
    if (!e.type) return;
    map[e.type] = (map[e.type] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}
