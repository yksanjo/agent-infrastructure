# UI Dashboard

[![npm version](https://img.shields.io/npm/v/ui-dashboard.svg)](https://www.npmjs.com/package/ui-dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Web dashboard for agent monitoring and workflow visualization

## 📦 Features

| Feature | Description |
|---------|-------------|
| **Real-time Monitoring** | Live agent status and logs |
| **Workflow Visualization** | Interactive DAG viewer |
| **Agent Control** | Start/stop/restart agents |
| **Metrics Dashboard** | Performance and cost tracking |
| **Log Viewer** | Searchable, filterable logs |
| **Task Queue** | View and manage pending tasks |

## 🚀 Quick Start

```bash
# Start the dashboard
cd ui-dashboard
npm install
npm start

# Open in browser
http://localhost:3000
```

## 📊 Screenshots

- Agent status overview
- Real-time execution logs
- Workflow graph visualization
- Token usage and costs

## 🔌 API

```javascript
// Connect to dashboard WebSocket
const ws = new WebSocket('ws://localhost:3000');

// Subscribe to agent events
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'agent-events'
}));

// Receive real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Agent update:', data);
};
```

## 📝 License

MIT License
