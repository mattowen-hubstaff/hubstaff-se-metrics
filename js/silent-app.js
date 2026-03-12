// Silent App implementations tab

function renderSilentApp(implementations) {
  document.getElementById('silent-app-content').innerHTML = `
    <div class="toolbar">
      <button class="btn-primary" onclick="showAddImplModal()">+ Add Implementation</button>
    </div>
    ${implementations.length === 0
      ? '<div class="empty-state">No implementations tracked yet. Add your first one above.</div>'
      : implementations.map(impl => renderImplCard(impl)).join('')}
    <div id="impl-modal" class="modal hidden">
      <div class="modal-box">
        <h3 id="impl-modal-title">Add Implementation</h3>
        <input id="impl-org" placeholder="Organisation name" class="input-field" />
        <input id="impl-contact" placeholder="Contact name" class="input-field" />
        <input id="impl-start" placeholder="Start date (e.g. 2026-03-16)" class="input-field" />
        <select id="impl-stage" class="input-field">
          ${STAGES.map(s => `<option>${s}</option>`).join('')}
        </select>
        <select id="impl-rag" class="input-field">
          ${RAG_OPTIONS.map(r => `<option>${r}</option>`).join('')}
        </select>
        <textarea id="impl-notes" placeholder="Notes" class="input-field" rows="3"></textarea>
        <input type="hidden" id="impl-edit-id" />
        <div class="modal-actions">
          <button class="btn-secondary" onclick="closeImplModal()">Cancel</button>
          <button class="btn-primary" onclick="saveImpl()">Save</button>
        </div>
      </div>
    </div>
  `;
}

function renderImplCard(impl) {
  const stageIdx = STAGES.indexOf(impl.stage);
  const ragClass = impl.rag.toLowerCase();
  return `
    <div class="impl-card">
      <div class="impl-header">
        <div>
          <div class="impl-org">${impl.org}</div>
          <div class="impl-contact">${impl.contact || '—'} · Started ${impl.start_date || '—'}</div>
        </div>
        <div class="impl-actions">
          <span class="rag-badge ${ragClass}">${impl.rag}</span>
          <button class="icon-btn" onclick="editImpl('${impl.id}')">✏️</button>
          <button class="icon-btn" onclick="removeImpl('${impl.id}')">🗑</button>
        </div>
      </div>
      <div class="stage-track">
        ${STAGES.map((s, i) => `<div class="stage-step ${i <= stageIdx ? 'done' : ''} ${i === stageIdx ? 'active' : ''}">${s}</div>`).join('')}
      </div>
      ${impl.notes ? `<div class="impl-notes">${impl.notes}</div>` : ''}
    </div>
  `;
}

function showAddImplModal() {
  document.getElementById('impl-modal-title').textContent = 'Add Implementation';
  document.getElementById('impl-edit-id').value = '';
  ['impl-org', 'impl-contact', 'impl-start', 'impl-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('impl-stage').value = STAGES[0];
  document.getElementById('impl-rag').value = 'Amber';
  document.getElementById('impl-modal').classList.remove('hidden');
}

function closeImplModal() {
  document.getElementById('impl-modal').classList.add('hidden');
}

function editImpl(id) {
  const impl = window._implementations.find(i => i.id === id);
  if (!impl) return;
  document.getElementById('impl-modal-title').textContent = 'Edit Implementation';
  document.getElementById('impl-edit-id').value = id;
  document.getElementById('impl-org').value = impl.org;
  document.getElementById('impl-contact').value = impl.contact || '';
  document.getElementById('impl-start').value = impl.start_date || '';
  document.getElementById('impl-stage').value = impl.stage;
  document.getElementById('impl-rag').value = impl.rag;
  document.getElementById('impl-notes').value = impl.notes || '';
  document.getElementById('impl-modal').classList.remove('hidden');
}

async function saveImpl() {
  const id = document.getElementById('impl-edit-id').value;
  const data = {
    org: document.getElementById('impl-org').value.trim(),
    contact: document.getElementById('impl-contact').value.trim(),
    start_date: document.getElementById('impl-start').value.trim(),
    stage: document.getElementById('impl-stage').value,
    rag: document.getElementById('impl-rag').value,
    notes: document.getElementById('impl-notes').value.trim()
  };
  if (!data.org) { showToast('Organisation name is required', 'error'); return; }
  showToast('Saving…', 'info');
  try {
    if (id) {
      await updateImplementation(id, data);
    } else {
      await addImplementation(data);
    }
    closeImplModal();
    await reloadAll();
    showToast('Saved!', 'success');
  } catch (e) {
    showToast('Save failed', 'error');
  }
}

async function removeImpl(id) {
  if (!confirm('Delete this implementation?')) return;
  try {
    await deleteImplementation(id);
    await reloadAll();
    showToast('Deleted', 'success');
  } catch (e) {
    showToast('Delete failed', 'error');
  }
}
