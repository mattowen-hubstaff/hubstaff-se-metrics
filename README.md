# hubstaff-se-metrics

Personal metrics dashboard for Matt Owen, Support Engineer at Hubstaff.

Tracks escalations, Silent App implementations, calls, time distribution, and CSAT week-over-week. Built as a static HTML/CSS/JS app backed by Supabase.

## Structure

```
hubstaff-se-metrics/
├── index.html          — Entry point
├── css/
│   └── styles.css      — All styling
├── js/
│   ├── config.js       — Supabase credentials + constants
│   ├── db.js           — All Supabase read/write operations
│   ├── overview.js     — Overview tab (KPIs + time distribution)
│   ├── silent-app.js   — Silent App implementation tracker
│   ├── escalations.js  — Escalation log
│   ├── trends.js       — Week-on-week charts
│   ├── week-log.js     — Weekly data entry
│   └── app.js          — Tab routing + data loading
└── README.md
```

## Running locally

Open `index.html` directly in Chrome. No build step required.

## Database

Backed by Supabase (`hubstaff-se-metrics` project). Tables:
- `weekly_metrics` — weekly numbers and time distribution
- `implementations` — Silent App deployment tracker
- `escalations` — escalation log

## Phase

Phase 1 — Baseline building. Goal is to establish what normal looks like over the first 90 days, not hit predefined targets.
