// Main app — tab routing and data loading

let currentTab = 'overview';

window._weeklyMetrics = [];
window._implementations = [];
window._escalations = [];

async function reloadAll() {
  try {
    const [wm, impl, esc] = await Promise.all([
      getWeeklyMetrics(),
      getImplementations(),
      getEscalations()
    ]);
    window._weeklyMetrics = wm || [];
    window._implementations = impl || [];
    window._escalations = esc || [];
    renderTab(currentTab);
  } catch (e) {
    showToast('Failed to load data from Supabase', 'error');
  }
}

function renderTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.toggle('hidden', el.id !== `${tab}-tab`);
  });

  switch (tab) {
    case 'overview':   renderOverview(window._weeklyMetrics, window._implementations, window._escalations); break;
    case 'silent-app': renderSilentApp(window._implementations); break;
    case 'escalations': renderEscalations(window._escalations); break;
    case 'trends':     renderTrends(window._weeklyMetrics); break;
    case 'week-log':   renderWeekLog(window._weeklyMetrics); populateWeekForm(); break;
  }
}

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderTab(btn.dataset.tab));
  });
  await reloadAll();
});
