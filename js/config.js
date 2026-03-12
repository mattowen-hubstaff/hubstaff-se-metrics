// Supabase configuration
const SUPABASE_URL = 'https://izcfxxcmqldzljsxzrlk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Y2Z4eGNtcWxkemxqc3h6cmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTg0MjUsImV4cCI6MjA4ODg3NDQyNX0.a8pgLAqth8KHZ2lPFSUPjhjiUxg1fkH3C1FKFS4Bg_c';

const TIME_TARGETS = {
  escalations: 40,
  calls: 20,
  docs: 20,
  async: 10,
  projects: 10
};

const STAGES = ['Pre-Deployment', 'Deployment', 'Validation', 'Stability'];
const RAG_OPTIONS = ['Green', 'Amber', 'Red'];
const ESCALATION_TYPES = ['Silent App', 'API', 'Network', 'MDM/RDS', 'Billing', 'Other'];
const ESCALATION_OUTCOMES = ['Resolved by SE', 'Escalated to Engineering', 'Pending'];
