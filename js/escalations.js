// Escalations tab

function renderEscalations(escalations) {
  const total = escalations.length;
  const resolved = escalations.filter(e => e.outcome === 'Resolved by SE').length;
  const escalatedEng = escalations.filter(e => e.outcome === 'Escalated to Engineering').length;

  document.getElementById('escalations-content').innerHTML = `
    <div class="toolbar">
      <div class="kpi-row">
        <div class="kpi-small"><span class="kpi-num">${total}</span> Total</div>
        <div class="kpi-small"><span class="kpi-num green">${resolved}</span> Resolved by SE</div>
        <div class="kpi-small"><span class="kpi-num amber">${escalatedEng}</span> To Engineering</div>
      </div>
      <button class="btn-primary" onclick="showAddEscModal()">+ Log Escalation</button>
    </div>
    <table class="data-table">
      <thead><tr>
        <th>Date</th><th>Org</th><th>Type</th><th>Outcome</th><th>Days</th><th>Notes</th><th></th>
      </tr></thead>
      <tbody>
        ${escalations.length === 0
          ? '<tr><td colspan="7" class="empty-cell">No escalations logged yet.</td></tr>'
          : escalations.map(e => `
            <tr>
              <td>${e.date || '—'}</td>
              <td>${e.org}</td>
              <td><span class="tag">${e.type}</span></td>
              <td><span class="outcome ${e.outcome.toLowerCase().replace(/ /g,'-')}">${e.outcome}</span></td>
              <td>${e.days_to_resolve ?? '—'}</td>
              <td class="notes-cell">${e.notes || '—'}</td>
              <td><button class="icon-btn" onclick="removeEscalation('${e.id}')">🗑</button></td>
            </tr>`).join('')}
      </tbody>
    </table>
    <div id="esc-modal" class="modal hidden">
      <div class="modal-box">
        <h3>Log Escalation</h3>
        <input id="esc-org" placeholder="Organisation" class="input-field" />
        <input id="esc-date" placeholder="Date (e.g. 2026-03-16)" class="input-field" />
        <select id="esc-type" class="input-field">
          ${ESCALATION_TYPES.map(t => `<option>${t}</option>`).join('')}
        </select>
        <select id="esc-outcome" class="input-field">
          ${ESCALATION_OUTCOMES.map(o => `<option>${o}</option>`).join('')}
        </select>
        <input id="esc-days" placeholder="Days to resolve" type="number" class="input-field" />
        <textarea id="esc-notes" placeholder="Notes" class="input-field" rows="3"></textarea>
        <div class="modal-actions">
          <button class="btn-secondary" onclick="closeEscModal()">Cancel</button>
          <button class="btn-primary" onclick="saveEscalation()">Save</button>
        </div>
      </div>
    </div>
  `;
}

function showAddEscModal() {
  ['esc-org', 'esc-date', 'esc-days', 'esc-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('esc-modal').classList.remove('hidden');
}

function closeEscModal() {
  document.getElementById('esc-modal').classList.add('hidden');
}

async function saveEscalation() {
  const data = {
    org: document.getElementById('esc-org').value.trim(),
    date: document.getElementById('esc-date').value.trim(),
    type: document.getElementById('esc-type').value,
    outcome: document.getElementById('esc-outcome').value,
    days_to_resolve: parseInt(document.getElementById('esc-days').value) || null,
    notes: document.getElementById('esc-notes').value.trim()
  };
  if (!data.org) { showToast('Organisation is required', 'error'); return; }
  showToast('Saving…', 'info');
  try {
    await addEscalation(data);
    closeEscModal();
    await reloadAll();
    showToast('Escalation logged!', 'success');
  } catch (e) {
    showToast('Save failed', 'error');
  }
}

async function removeEscalation(id) {
  if (!confirm('Delete this escalation?')) return;
  try {
    await deleteEscalation(id);
    await reloadAll();
    showToast('Deleted', 'success');
  } catch (e) {
    showToast('Delete failed', 'error');
  }
}
