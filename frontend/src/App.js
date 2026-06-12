import React, { useState, useEffect } from 'react';
import './App.css';

const AGENTS = [
  { id: 1, name: 'HR Agent',       role: 'Leave, Policy, Onboarding',  status: 'active',  tasks: 24, confidence: 92, color: '#7F77DD' },
  { id: 2, name: 'Support Agent',  role: 'Tickets, Bugs, Requests',     status: 'active',  tasks: 38, confidence: 88, color: '#1D9E75' },
  { id: 3, name: 'Finance Agent',  role: 'Expenses, Invoices, Budget',  status: 'idle',    tasks: 12, confidence: 95, color: '#BA7517' },
  { id: 4, name: 'Security Agent', role: 'Access, Anomalies, Alerts',   status: 'active',  tasks: 7,  confidence: 79, color: '#D85A30' },
  { id: 5, name: 'Report Agent',   role: 'Summaries, Analytics, KPIs',  status: 'idle',    tasks: 5,  confidence: 97, color: '#185FA5' },
];

const INITIAL_ACTIVITIES = [
  { id: 1, agent: 'Support Agent',  action: 'Auto-resolved ticket #1042 — password reset',          time: '2 min ago',  status: 'resolved' },
  { id: 2, agent: 'HR Agent',       action: 'Approved leave request for John D. (3 days)',           time: '5 min ago',  status: 'resolved' },
  { id: 3, agent: 'Security Agent', action: 'Flagged unusual login from new location — escalated',  time: '9 min ago',  status: 'escalated' },
  { id: 4, agent: 'Finance Agent',  action: 'Auto-approved expense $45 — under threshold',           time: '14 min ago', status: 'resolved' },
  { id: 5, agent: 'Support Agent',  action: 'Merged 3 duplicate tickets about email outage',         time: '18 min ago', status: 'resolved' },
];

function StatusDot({ status }) {
  const colors = { active: '#1D9E75', idle: '#BA7517', error: '#D85A30' };
  return (
    <span style={{
      display: 'inline-block', width: 10, height: 10,
      borderRadius: '50%', backgroundColor: colors[status] || '#888',
      marginRight: 8, boxShadow: `0 0 6px ${colors[status]}`
    }} />
  );
}

function AgentCard({ agent }) {
  return (
    <div style={{
      background: '#1a1d27', border: `1px solid ${agent.color}33`,
      borderRadius: 12, padding: '20px', marginBottom: 16,
      borderLeft: `4px solid ${agent.color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StatusDot status={agent.status} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{agent.name}</span>
          </div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 4, marginLeft: 18 }}>{agent.role}</div>
        </div>
        <span style={{
          background: agent.status === 'active' ? '#1D9E7522' : '#BA751722',
          color: agent.status === 'active' ? '#1D9E75' : '#BA7517',
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          textTransform: 'uppercase'
        }}>{agent.status}</span>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ background: '#0f1117', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: agent.color }}>{agent.tasks}</div>
          <div style={{ fontSize: 11, color: '#888' }}>Tasks Today</div>
        </div>
        <div style={{ background: '#0f1117', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: agent.color }}>{agent.confidence}%</div>
          <div style={{ fontSize: 11, color: '#888' }}>Confidence</div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const statusColors = { resolved: '#1D9E75', escalated: '#D85A30', pending: '#BA7517' };
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #ffffff11', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0, backgroundColor: statusColors[activity.status] || '#888' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7F77DD', marginBottom: 2 }}>{activity.agent}</div>
        <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.4 }}>{activity.action}</div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{activity.time}</div>
      </div>
    </div>
  );
}

function AIResponseCard({ result, onClose }) {
  const catColors = { hr: '#7F77DD', support: '#1D9E75', finance: '#BA7517', security: '#D85A30' };
  const col = catColors[result.category] || '#7F77DD';
  return (
    <div style={{
      background: '#1a1d27', border: `1px solid ${col}`,
      borderRadius: 12, padding: '20px', marginBottom: 20,
      borderLeft: `4px solid ${col}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{result.agent}</span>
          <span style={{ background: '#1D9E7522', color: '#1D9E75', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
            {result.confidence}% confidence
          </span>
          <span style={{ background: '#1D9E7522', color: '#1D9E75', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
            ✓ {result.action_taken}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      <div style={{ fontSize: 13, color: '#ddd', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.response}</div>
    </div>
  );
}

export default function App() {
  const [activities, setActivities]   = useState(INITIAL_ACTIVITIES);
  const [totalTasks, setTotalTasks]   = useState(86);
  const [events, setEvents]           = useState(142);
  const [inputText, setInputText]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [aiResult, setAiResult]       = useState(null);
  const [error, setError]             = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTasks(t => t + 1);
      setEvents(e => e + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setAiResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setAiResult(data);
      setTotalTasks(t => t + 1);
      const newActivity = {
        id: Date.now(),
        agent: data.agent,
        action: inputText.slice(0, 60) + (inputText.length > 60 ? '...' : ''),
        time: 'just now',
        status: data.status,
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 6)]);
    } catch (err) {
      setError('Could not connect to backend. Make sure it is running on port 8000.');
    }
    setLoading(false);
    setInputText('');
  };

  const activeAgents = AGENTS.filter(a => a.status === 'active').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* SIDEBAR */}
      <div style={{ width: 240, background: '#13151f', borderRight: '1px solid #ffffff11', padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#7F77DD', letterSpacing: 1 }}>⚡ AI AUTOPILOT</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Enterprise Operations System</div>
        </div>
        <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>AGENTS</div>
        {AGENTS.map(agent => (
          <div key={agent.id} style={{
            display: 'flex', alignItems: 'center', padding: '10px 12px',
            borderRadius: 8, marginBottom: 4, background: '#ffffff08',
          }}>
            <StatusDot status={agent.status} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{agent.name}</div>
              <div style={{ fontSize: 10, color: '#555' }}>{agent.tasks} tasks today</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 32, padding: '12px', background: '#1D9E7511', borderRadius: 8, border: '1px solid #1D9E7533' }}>
          <div style={{ fontSize: 11, color: '#1D9E75', fontWeight: 700 }}>System Status</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>All systems operational</div>
          <div style={{ fontSize: 11, color: '#1D9E75', marginTop: 4 }}>↑ 99.9% uptime</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Operations Dashboard</h1>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Real-time AI agent monitoring and autonomous task execution</p>
        </div>

        {/* STATS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Tasks Completed',  value: totalTasks,              unit: 'today',      color: '#7F77DD' },
            { label: 'Events Processed', value: events,                  unit: 'today',      color: '#1D9E75' },
            { label: 'Active Agents',    value: `${activeAgents}/5`,     unit: 'online',     color: '#BA7517' },
            { label: 'Cost Saved',       value: '$2,840',                unit: 'this month', color: '#185FA5' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#1a1d27', borderRadius: 12, padding: '16px 20px',
              border: `1px solid ${stat.color}33`, borderTop: `3px solid ${stat.color}`
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: '#555' }}>{stat.unit}</div>
            </div>
          ))}
        </div>

        {/* AI INPUT BOX */}
        <div style={{ background: '#1a1d27', borderRadius: 12, padding: '20px', marginBottom: 24, border: '1px solid #7F77DD33' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7F77DD', marginBottom: 12 }}>⚡ SUBMIT EVENT TO AI AGENTS</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. I need 3 days leave next week / My laptop won't connect to VPN / Approve expense $80"
              style={{
                flex: 1, background: '#0f1117', border: '1px solid #ffffff22',
                borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? '#333' : '#7F77DD', color: '#fff',
                border: 'none', borderRadius: 8, padding: '12px 24px',
                fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '⏳ Processing...' : '🚀 Send to AI'}
            </button>
          </div>
          {error && <div style={{ color: '#D85A30', fontSize: 12, marginTop: 8 }}>{error}</div>}
          <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>
            Try: "I need sick leave tomorrow" · "Reset my password" · "Approve $50 expense" · "Suspicious login detected"
          </div>
        </div>

        {/* AI RESPONSE */}
        {aiResult && <AIResponseCard result={aiResult} onClose={() => setAiResult(null)} />}

        {/* AGENTS + ACTIVITY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 16 }}>AGENT STATUS</div>
            {AGENTS.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 16 }}>LIVE ACTIVITY FEED</div>
            <div style={{ background: '#1a1d27', borderRadius: 12, padding: '20px', border: '1px solid #ffffff11' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Recent Actions</span>
                <span style={{ background: '#1D9E7522', color: '#1D9E75', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>● LIVE</span>
              </div>
              {activities.map(activity => <ActivityItem key={activity.id} activity={activity} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}