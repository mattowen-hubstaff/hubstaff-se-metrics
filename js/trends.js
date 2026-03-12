// Trends tab — week-on-week charts using Canvas

function renderTrends(weeklyMetrics) {
  const weeks = weeklyMetrics.map(w => w.week);
  const escalationsData = weeklyMetrics.map(w => w.escalations || 0);
  const callsData = weeklyMetrics.map(w => w.calls || 0);
  const csatData = weeklyMetrics.map(w => w.csat_score || 0);
  const docsData = weeklyMetrics.map(w => w.docs_completed || 0);

  document.getElementById('trends-content').innerHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-title">Escalations per Week</div>
        <canvas id="chart-esc" height="140"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">Calls Joined per Week</div>
        <canvas id="chart-calls" height="140"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">CSAT Score (out of 5)</div>
        <canvas id="chart-csat" height="140"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">Docs Completed per Week</div>
        <canvas id="chart-docs" height="140"></canvas>
      </div>
    </div>
  `;

  drawBarChart('chart-esc', weeks, escalationsData, '#1C8EF9');
  drawBarChart('chart-calls', weeks, callsData, '#36C5B0');
  drawLineChart('chart-csat', weeks, csatData, '#F59E0B', 5);
  drawBarChart('chart-docs', weeks, docsData, '#8B5CF6');
}

function drawBarChart(id, labels, data, colour) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  const H = canvas.height;
  canvas.width = W;
  const max = Math.max(...data, 1);
  const pad = { top: 10, right: 10, bottom: 30, left: 30 };
  const barW = (W - pad.left - pad.right) / labels.length * 0.6;
  const gap = (W - pad.left - pad.right) / labels.length;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (H - pad.top - pad.bottom) * (1 - i / 4);
    ctx.strokeStyle = '#1e2d3d';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = '#4a6278';
    ctx.font = '10px monospace';
    ctx.fillText(Math.round(max * i / 4), 2, y + 4);
  }

  data.forEach((val, i) => {
    const x = pad.left + i * gap + gap / 2 - barW / 2;
    const barH = ((H - pad.top - pad.bottom) * val) / max;
    const y = H - pad.bottom - barH;
    ctx.fillStyle = colour + 'cc';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = '#7a9bb5';
    ctx.font = '10px monospace';
    ctx.fillText(labels[i], pad.left + i * gap + gap / 2 - 10, H - 8);
  });
}

function drawLineChart(id, labels, data, colour, maxVal) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  const H = canvas.height;
  canvas.width = W;
  const pad = { top: 10, right: 10, bottom: 30, left: 30 };
  const gap = (W - pad.left - pad.right) / (labels.length - 1 || 1);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i <= 5; i++) {
    const y = pad.top + (H - pad.top - pad.bottom) * (1 - i / 5);
    ctx.strokeStyle = '#1e2d3d';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = '#4a6278';
    ctx.font = '10px monospace';
    ctx.fillText((maxVal * i / 5).toFixed(1), 2, y + 4);
  }

  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = pad.left + i * gap;
    const y = pad.top + (H - pad.top - pad.bottom) * (1 - val / maxVal);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  data.forEach((val, i) => {
    const x = pad.left + i * gap;
    const y = pad.top + (H - pad.top - pad.bottom) * (1 - val / maxVal);
    ctx.fillStyle = colour;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a9bb5';
    ctx.font = '10px monospace';
    ctx.fillText(labels[i], x - 10, H - 8);
  });
}
