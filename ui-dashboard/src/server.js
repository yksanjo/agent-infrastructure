/**
 * UI Dashboard Server
 * Real-time agent monitoring with WebSocket support
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// State
const agents = new Map();
const workflows = new Map();
const logs = [];
const metrics = {
  totalTasks: 0,
  completedTasks: 0,
  failedTasks: 0,
  totalTokens: 0,
  totalCost: 0,
};

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// REST API
app.get('/api/agents', (req, res) => {
  res.json(Array.from(agents.values()));
});

app.get('/api/agents/:id', (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json(agent);
});

app.post('/api/agents/:id/start', (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  agent.status = 'running';
  broadcast({ type: 'agent-update', agent });
  res.json({ success: true, agent });
});

app.post('/api/agents/:id/stop', (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  agent.status = 'stopped';
  broadcast({ type: 'agent-update', agent });
  res.json({ success: true, agent });
});

app.get('/api/workflows', (req, res) => {
  res.json(Array.from(workflows.values()));
});

app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(logs.slice(-limit));
});

app.get('/api/metrics', (req, res) => {
  res.json(metrics);
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          ws.subscribe = data.channel;
          console.log(`Client subscribed to ${data.channel}`);
          break;
        
        case 'agent-action':
          handleAgentAction(data.action, ws);
          break;
        
        case 'log-query':
          sendFilteredLogs(ws, data.query);
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    agents: Array.from(agents.values()),
    workflows: Array.from(workflows.values()),
    metrics,
  }));
});

// Broadcast to all clients
function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message));
    }
  });
}

// Handle agent actions
function handleAgentAction(action, ws) {
  const { agentId, action: actionType, payload } = action;
  
  const logEntry = {
    timestamp: Date.now(),
    type: 'action',
    agentId,
    action: actionType,
    payload,
  };
  
  logs.push(logEntry);
  if (logs.length > 10000) logs.shift();
  
  broadcast({ type: 'log', log: logEntry });
}

// Send filtered logs
function sendFilteredLogs(ws, query) {
  const filtered = logs.filter(log => 
    JSON.stringify(log).toLowerCase().includes(query.toLowerCase())
  );
  ws.send(JSON.stringify({ type: 'logs', logs: filtered }));
}

// Agent event handlers
export function registerAgent(agent) {
  agents.set(agent.id, {
    id: agent.id,
    name: agent.name,
    status: 'idle',
    type: agent.type,
    createdAt: Date.now(),
    tasksCompleted: 0,
    lastActivity: Date.now(),
  });
  
  broadcast({ type: 'agent-registered', agent: agents.get(agent.id) });
}

export function updateAgentStatus(agentId, status, data = {}) {
  const agent = agents.get(agentId);
  if (agent) {
    agent.status = status;
    agent.lastActivity = Date.now();
    Object.assign(agent, data);
    broadcast({ type: 'agent-update', agent });
  }
}

export function logEvent(event) {
  const logEntry = {
    timestamp: Date.now(),
    ...event,
  };
  
  logs.push(logEntry);
  if (logs.length > 10000) logs.shift();
  
  broadcast({ type: 'log', log: logEntry });
}

export function updateMetrics(delta) {
  Object.keys(delta).forEach(key => {
    if (metrics.hasOwnProperty(key)) {
      metrics[key] += delta[key];
    }
  });
  broadcast({ type: 'metrics-update', metrics });
}

// Start server
const PORT = process.env.DASHBOARD_PORT || 3000;
server.listen(PORT, () => {
  console.log(`🖥️  Dashboard running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket at ws://localhost:${PORT}/ws`);
});

export { app, server, wss };
