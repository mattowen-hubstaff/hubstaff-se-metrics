// Docs tab — log and view docs completed

let _viewingDoc = null; // id of doc open in detail view

function renderDocs(docs) {
  const container = document.getElementById('docs-content');
  if (!container) return;

  if (_viewingDoc) {
    const doc = docs.find(d => d.id === _viewingDoc);
    if (!doc) _viewingDoc = null;
    else { renderDocDetail(doc); return; }
  }

  const total    = docs.length;
  const thisWeek = docs.filter(d => isThisWeek(d.date)).length;

  container.innerHTML = `
    <div class="tab-kpi-bar">
      <div class="kpi-card"><div class="kpi-val">${total}</div><div class="kpi-label">Total Docs</div></div>
      <div class="kpi-card"><div class="kpi-val">${thisWeek}</div><div class="kpi-label">This Week</div></div>
    </div>

    <div class="section-title" style="margin-top:24px">Log a Doc</div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group">
          <label>Date Completed <span class="required">*</span></label>
          <input id="doc-date" type="date" class="input-field" value="${todayStr()}" />
        </div>
        <div class="form-group">
          <label>Document Title <span class="required">*</span></label>
          <input id="doc-title" type="text" class="input-field" placeholder="e.g. Silent App Deployment Guide" />
        </div>
      </div>
      <div class="form-group" style="margin-top:12px">
        <label>URL <span class="target-hint">(optional)</span></label>
        <input id="doc-url" type="text" class="input-field" placeholder="https://…" />
      </div>
      <div class="form-group" style="margin-top:12px">
        <label>Notes <span class="target-hint">(optional)</span></label>
        <textarea id="doc-notes" class="input-field" rows="3" placeholder="What is this doc? Who is it for?"></textarea>
      </div>
      <div style="margin-top:16px">
        <button class="btn-primary" onclick="saveDoc()">+ Log Doc</button>
      </div>
    </div>

    <div class="section-title" style="margin-top:32px">All Docs</div>
    <table class="data-table">
      <thead><tr>
        <th>Date</th><th>Title</th><th>URL</th><th>Notes</th><th></th>
      </tr></thead>
      <tbody>
        ${docs.length === 0
          ? '<tr><td colspan="5" class="empty-cell">No docs logged yet.</td></tr>'
          : docs.map(d => `
              <tr class="clickable-row" onclick="openDocDetail('${d.id}')">
                <td>${d.date || '—'}</td>
                <td>${d.title}</td>
                <td>${d.url ? `<a href="${d.url}" target="_blank" onclick="event.stopPropagation()" class="table-link">↗ Link</a>` : '—'}</td>
                <td class="notes-cell">${d.notes ? d.notes.substring(0, 80) + (d.notes.length > 80 ? '…' : '') : '—'}</td>
                <td><button class="btn-danger-sm" onclick="event.stopPropagation();deleteDocRecord('${d.id}')">Delete</button></td>
              </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function renderDocDetail(doc) {
  const container = document.getElementById('docs-content');

  container.innerHTML = `
    <button class="btn-secondary" style="margin-bottom:16px" onclick="_viewingDoc=null;renderTab('docs')">← Back to Docs</button>

    <div class="detail-card">
      <div class="detail-header">
        <div>
          <div class="detail-title">${doc.title}</div>
          <div class="detail-meta">${doc.date || '—'}</div>
        </div>
        <button class="btn-danger-sm" onclick="deleteDocRecord('${doc.id}')">Delete</button>
      </div>

      ${doc.url ? `<div style="margin-top:12px"><a href="${doc.url}" target="_blank" class="table-link">↗ Open Document</a></div>` : ''}
      ${doc.notes ? `<div class="detail-notes" style="margin-top:12px">${doc.notes}</div>` : ''}
    </div>
  `;
}

function openDocDetail(id) {
  _viewingDoc = id;
  renderTab('docs');
}

async function saveDoc() {
  const date  = document.getElementById('doc-date').value.trim();
  const title = document.getElementById('doc-title').value.trim();
  const url   = document.getElementById('doc-url').value.trim();
  const notes = document.getElementById('doc-notes').value.trim();

  if (!date)  { showToast('Date is required', 'error');  return; }
  if (!title) { showToast('Title is required', 'error'); return; }

  const data = {
    date,
    title,
    url:   url   || null,
    notes: notes || null,
  };

  showToast('Saving…', 'info');
  try {
    await addDoc(data);
    await reloadAll();
    showToast('Doc logged!', 'success');
  } catch (e) {
    showToast('Save failed', 'error');
  }
}

async function deleteDocRecord(id) {
  if (!confirm('Delete this doc?')) return;
  try {
    await deleteDoc(id);
    _viewingDoc = null;
    await reloadAll();
    showToast('Doc deleted', 'success');
  } catch (e) {
    showToast('Delete failed', 'error');
  }
}
