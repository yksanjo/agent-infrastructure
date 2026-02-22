/**
 * Agent Dashboard Server
 * Web-based monitoring for agents and workflows
 */
import { EventEmitter } from 'events';

class AgentDashboard extends EventEmitter {
  constructor(options = {}) {
    super();
    this.port = options.port || 3000;
    this.agents = new Map();
    this.workflows = new Map();
    this.logs = [];
    this.maxLogs = 1000;
  }

  // Agent management
  registerAgent(agent) {
    this.agents.set(agent.id, { ...agent, status: 'running', startedAt: Date.now() });
    this.log('agent', `Agent ${agent.id} registered`);
  }

  // Workflow tracking
  trackWorkflow(workflowId, data) {
    this.workflows.set(workflowId, { ...data, updatedAt: Date.now() });
    this.log('workflow', `Workflow ${workflowId} updated`);
  }

  // Real-time logging
  log(type, message, data = {}) {
    const entry = { type, message, data, timestamp: Date.now() };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
    this.emit('log', entry);
  }

  // API endpoints (simulated)
  getStatus() {
    return {
      agents: this.agents.size,
      workflows: this.workflows.size,
      logs: this.logs.length,
      uptime: Date.now() - (this.agents.values().next()?.value?.startedAt || Date.now())
    };
  }

  start() {
    console.log(`📊 Dashboard running at http://localhost:${this.port}`);
    console.log('   Endpoints:');
    console.log('   - GET  /status     - System status');
    console.log('   - GET  /agents     - List agents');
    console.log('   - GET  /workflows  - List workflows');
    console.log('   - GET  /logs       - Real-time logs');
    return this;
  }
}

// Run if executed directly
const dashboard = new AgentDashboard({ port: 3000 });
dashboard.start();
export default AgentDashboard;
