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
    case 'insights':    renderInsights(window._escalations); break;
    case 'trends':     renderTrends(window._weeklyMetrics); break;
    case 'week-log':   renderWeekLog(window._weeklyMetrics); populateWeekForm(); break;
  }
}

function switchTab(tab) {
  renderTab(tab);
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

// ── Help Guide ────────────────────────────────────────────────────────────────

const HELP_CONTENT = {
  overview: {
    title: '🏠 Overview',
    html: `
      <div class="help-section">
        <h3>What is this dashboard?</h3>
        <p>The SE Metrics Dashboard is your personal command centre as Hubstaff's Support Engineer. It tracks three core things: your <strong>weekly activity</strong> (time split across calls, escalations, docs, etc.), your <strong>Silent App implementation journeys</strong>, and your <strong>escalations</strong> to and from engineering.</p>
      </div>
      <div class="help-section">
        <h3>The tabs</h3>
        <div class="help-table-wrap"><table class="help-table">
          <tr><th>Tab</th><th>What it's for</th></tr>
          <tr><td><strong>Overview</strong></td><td>A snapshot of the current week — time split, active implementations, and recent escalations at a glance.</td></tr>
          <tr><td><strong>Silent App</strong></td><td>Track every customer's Silent App implementation from pre-deployment through to stability. Kanban board + detail view with checklists and activity log.</td></tr>
          <tr><td><strong>Escalations</strong></td><td>Log and track every escalation you handle. Each one gets a full timeline of what happened, Slack/HubSpot links, and outcome tracking.</td></tr>
          <tr><td><strong>Insights</strong></td><td>Patterns across your escalations — most common types, orgs, outcomes, and time to resolve.</td></tr>
          <tr><td><strong>Trends</strong></td><td>Your weekly metrics visualised over time — are you hitting your time targets? Where is time going?</td></tr>
          <tr><td><strong>Week Log</strong></td><td>Log your weekly hours across the five core buckets (escalations, calls, docs, async, projects).</td></tr>
        </table></div>
      </div>
      <div class="help-section">
        <h3>Data storage</h3>
        <p>All data is stored in Supabase (a cloud database). It persists across sessions and is accessible anywhere. Nothing is stored locally in the browser.</p>
      </div>
    `
  },
  'silent-app': {
    title: '🖥️ Silent App Tracker',
    html: `
      <div class="help-section">
        <h3>What is the Silent App tracker?</h3>
        <p>This is where you manage every customer's Silent App deployment journey — from the first pre-deployment conversation through to a stable, fully-running rollout. Each customer org gets its own record with a checklist, activity log, and linked escalations.</p>
      </div>
      <div class="help-section">
        <h3>The four stages</h3>
        <div class="help-table-wrap"><table class="help-table">
          <tr><th>Stage</th><th>What it means</th></tr>
          <tr><td><strong>Pre-Deployment</strong></td><td>Discovery and preparation. Confirming plan, OS, deployment method, MDM tool, device count, and creating the tracking policy in Hubstaff.</td></tr>
          <tr><td><strong>Deployment</strong></td><td>Active rollout. Pilot install on 1–2 machines, then 3–4, then full fleet. Watching for auto-provisioning and duplicate members.</td></tr>
          <tr><td><strong>Validation</strong></td><td>Confirming everything works — tracking data appearing, correct members created, screenshots and permissions working, all devices on the Computers page.</td></tr>
          <tr><td><strong>Stability</strong></td><td>Customer confirmed everything is running consistently. CSAT collected, implementation closed.</td></tr>
        </table></div>
      </div>
      <div class="help-section">
        <h3>RAG status</h3>
        <p>Set manually by you. Use it to flag how the deployment is going:</p>
        <ul class="help-list">
          <li><strong style="color:var(--green)">🟢 Green</strong> — On track, no blockers.</li>
          <li><strong style="color:var(--amber)">🟡 Amber</strong> — Needs attention. Something is slowing progress or needs follow-up.</li>
          <li><strong style="color:var(--red)">🔴 Red</strong> — At risk. Deployment is stalled, customer is frustrated, or there's a technical blocker.</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Kanban board</h3>
        <p>Each card represents one customer org. The progress bar shows how many checklist items are complete for that stage. <strong>Drag cards between columns</strong> to move an org to a new stage — this saves automatically and logs an activity entry.</p>
      </div>
      <div class="help-section">
        <h3>Detail view</h3>
        <p>Click any card or table row to open the full detail view. Here you can:</p>
        <ul class="help-list">
          <li>Tick off checklist items — each tick saves immediately to the database.</li>
          <li>Add activity log entries — record what happened, what's next, and attach Slack or HubSpot URLs.</li>
          <li>Update stage or RAG status via an activity entry — change them together in one save.</li>
          <li>See any escalations linked to this org (pulled from the Escalations tab).</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Checklists</h3>
        <p>Each stage has a built-in checklist derived from Hubstaff's official Silent App setup guides. The current stage's checklist is highlighted in blue. Checklists for earlier stages stay visible so you can tick retrospectively if needed.</p>
      </div>
    `
  },
  escalations: {
    title: '🔺 Escalations',
    html: `
      <div class="help-section">
        <h3>What counts as an escalation?</h3>
        <p>Any case you take ownership of that requires investigation, triage, or handoff — whether it stays with you (Resolved by SE), goes to engineering, or is pending. Log it here so you have a full record.</p>
      </div>
      <div class="help-section">
        <h3>Logging an escalation</h3>
        <p>Click <strong>+ Log Escalation</strong>. Fill in:</p>
        <ul class="help-list">
          <li><strong>Organisation</strong> — starts autocompleting from existing orgs as you type.</li>
          <li><strong>Date</strong> — use the date picker. Dates are stored as YYYY-MM-DD internally regardless of how they display.</li>
          <li><strong>Type</strong> — the category of issue (Silent App, API, Network, MDM/RDS, Billing, Other).</li>
          <li><strong>Outcome</strong> — Resolved by SE, Escalated to Engineering, or Pending.</li>
          <li><strong>Days to resolve</strong> — how long it took (or is taking).</li>
          <li><strong>Notes</strong> — any context worth capturing.</li>
          <li><strong>Related escalation</strong> — optional. Links to a previous escalation from the same or different org.</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Timeline (case history)</h3>
        <p>Click any row to open the escalation detail view. The timeline shows every update added to this case. Add entries to record: what you investigated, what you found, what was sent to engineering, and what the outcome was. Each entry can include a Slack thread URL and a HubSpot URL.</p>
      </div>
      <div class="help-section">
        <h3>Related escalations</h3>
        <p>If a new escalation is related to a previous one (e.g. a recurring issue at the same org), use the <strong>Related escalation</strong> field when logging. The detail view will show a two-way link between both records so you can navigate between them.</p>
      </div>
      <div class="help-section">
        <h3>Outcomes explained</h3>
        <div class="help-table-wrap"><table class="help-table">
          <tr><th>Outcome</th><th>Meaning</th></tr>
          <tr><td><strong>Resolved by SE</strong></td><td>You diagnosed and resolved it without needing engineering involvement.</td></tr>
          <tr><td><strong>Escalated to Engineering</strong></td><td>Passed to engineering with a full diagnostic write-up.</td></tr>
          <tr><td><strong>Pending</strong></td><td>Still open — under investigation or waiting on the customer or engineering.</td></tr>
        </table></div>
      </div>
    `
  },
  'week-log': {
    title: '📅 Week Log',
    html: `
      <div class="help-section">
        <h3>What is the Week Log?</h3>
        <p>A weekly record of how your time was split across your five core buckets. This feeds the Trends chart and gives you and Michael a clear picture of whether the role is balanced as planned.</p>
      </div>
      <div class="help-section">
        <h3>The five buckets</h3>
        <div class="help-table-wrap"><table class="help-table">
          <tr><th>Bucket</th><th>Target</th><th>What goes here</th></tr>
          <tr><td><strong>Escalations</strong></td><td>40%</td><td>Triage, investigation, write-ups, and resolving escalations.</td></tr>
          <tr><td><strong>Calls</strong></td><td>20%</td><td>Sales, Success, and customer calls.</td></tr>
          <tr><td><strong>Documentation</strong></td><td>20%</td><td>Writing guides, updating internal docs, onboarding content.</td></tr>
          <tr><td><strong>Cross-team async</strong></td><td>10%</td><td>Slack threads, async collaboration with engineering, product feedback.</td></tr>
          <tr><td><strong>Special Projects</strong></td><td>10%</td><td>This dashboard, the resource hub, ROE document — approved side projects.</td></tr>
        </table></div>
      </div>
      <div class="help-section">
        <h3>Logging a week</h3>
        <p>At the end of each week, enter your hours in each bucket and add any notes. The dashboard calculates your percentage split automatically and compares it to the targets from your 90-day plan.</p>
      </div>
      <div class="help-section">
        <h3>Where do the hours come from?</h3>
        <p>Pull them from your Hubstaff timer data — you should be logging time to the correct project/task throughout the week. The Hubstaff timer is the source of truth, this dashboard just gives it context.</p>
      </div>
    `
  },
  tips: {
    title: '💡 Tips & Shortcuts',
    html: `
      <div class="help-section">
        <h3>General</h3>
        <ul class="help-list">
          <li>Click outside any modal to close it.</li>
          <li>All dropdowns (org autocomplete, related escalation) dismiss when you click elsewhere on the page.</li>
          <li>Date fields are native date pickers — no need to type the format manually.</li>
          <li>All data saves to Supabase immediately — there's no manual save step beyond clicking the Save button in a modal.</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Silent App tracker</h3>
        <ul class="help-list">
          <li><strong>Drag cards</strong> in the Kanban view to move an org to a new stage — this auto-logs the stage change in the activity log.</li>
          <li>Use the <strong>Table view</strong> for a quick status scan across all orgs.</li>
          <li>Checklist progress is shown on both the kanban card and the detail view — tick items in the detail view.</li>
          <li>Activity log entries are shown newest-first. Add a note every time something significant happens — it builds a record you can refer back to in calls with Michael.</li>
          <li>RAG status can be changed from the Edit button or via an Activity Log entry — use the entry method when you want to record <em>why</em> the status changed.</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Escalations</h3>
        <ul class="help-list">
          <li>The organisation field autocompletes — type a few letters and select from the list to keep org names consistent.</li>
          <li>The "Related escalation" field defaults to showing escalations from the same org. Click "Search all organisations…" to search across everything.</li>
          <li>Always add at least one timeline entry when you resolve or escalate — it's your audit trail.</li>
          <li>Slack and HubSpot URLs on timeline entries open in a new tab.</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Keyboard & browser</h3>
        <ul class="help-list">
          <li><strong>Cmd+Shift+R</strong> (Mac) — hard refresh if the app looks stale after an update.</li>
          <li>The app works across any browser tab — bookmark it for quick access.</li>
        </ul>
      </div>
    `
  }
};

function openHelpModal(tab) {
  document.getElementById('help-overlay').classList.remove('hidden');
  showHelpTab(tab || 'overview');
}

function closeHelpModal() {
  document.getElementById('help-overlay').classList.add('hidden');
}

function showHelpTab(tab) {
  document.querySelectorAll('.help-nav-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes("'" + tab + "'"));
  });
  var content = HELP_CONTENT[tab];
  if (!content) return;
  document.getElementById('help-body').innerHTML =
    '<h2 class="help-body-title">' + content.title + '</h2>' + content.html;
}

// Close help on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeHelpModal();
});
