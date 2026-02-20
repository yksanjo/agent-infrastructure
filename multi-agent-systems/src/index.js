/**
 * Multi-Agent Systems
 * Collaboration and communication frameworks
 */

/**
 * Agent - Individual agent in a multi-agent system
 */
export class Agent {
  constructor(name, options = {}) {
    this.name = name;
    this.role = options.role || 'general';
    this.tools = options.tools || [];
    this.state = 'idle';
    this.messageHistory = [];
  }

  async receive(message) {
    this.messageHistory.push({
      from: message.from,
      content: message.content,
      timestamp: Date.now(),
    });
    
    this.state = 'processing';
    const response = await this._process(message);
    this.state = 'idle';
    
    return response;
  }

  async _process(message) {
    // Placeholder - agent-specific logic
    return {
      from: this.name,
      content: `Processed: ${message.content}`,
      role: this.role,
    };
  }

  getStatus() {
    return {
      name: this.name,
      role: this.role,
      state: this.state,
      messagesReceived: this.messageHistory.length,
    };
  }
}

/**
 * Agent Society - Manage multiple collaborating agents
 */
export class AgentSociety {
  constructor() {
    this.agents = new Map();
    this.messageBus = new MessageBus();
  }

  addAgent(name, options) {
    const agent = new Agent(name, options);
    this.agents.set(name, agent);
    this.messageBus.registerAgent(name);
    return this;
  }

  getAgent(name) {
    return this.agents.get(name);
  }

  async collaborate(options) {
    const { task, protocol = 'sequential' } = options;
    const results = [];
    
    const agentList = Array.from(this.agents.values());
    
    if (protocol === 'sequential') {
      let currentInput = task;
      for (const agent of agentList) {
        const response = await agent.receive({
          from: 'coordinator',
          content: currentInput,
        });
        results.push(response);
        currentInput = response.content;
      }
    } else if (protocol === 'round-robin') {
      for (let i = 0; i < 3; i++) {
        for (const agent of agentList) {
          const response = await agent.receive({
            from: 'coordinator',
            content: task,
          });
          results.push(response);
        }
      }
    }
    
    return {
      task,
      protocol,
      results,
      completedAt: Date.now(),
    };
  }

  listAgents() {
    return Array.from(this.agents.values()).map(a => a.getStatus());
  }
}

/**
 * Message Bus - Inter-agent communication
 */
export class MessageBus {
  constructor() {
    this.agents = new Set();
    this.messages = [];
    this.subscribers = new Map();
  }

  registerAgent(name) {
    this.agents.add(name);
  }

  subscribe(agent, topic) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(agent);
  }

  publish(topic, message) {
    const subscribers = this.subscribers.get(topic) || [];
    this.messages.push({
      topic,
      message,
      timestamp: Date.now(),
    });
    return subscribers.length;
  }

  getHistory(limit = 10) {
    return this.messages.slice(-limit);
  }
}

/**
 * Collaboration Protocol - Define agent interaction patterns
 */
export class CollaborationProtocol {
  constructor(name) {
    this.name = name;
    this.steps = [];
  }

  addStep(role, action) {
    this.steps.push({ role, action });
    return this;
  }

  async execute(agents, task) {
    const results = [];
    for (const step of this.steps) {
      const agent = Array.from(agents).find(a => a.role === step.role);
      if (agent) {
        const result = await agent.receive({
          from: 'protocol',
          content: task,
          action: step.action,
        });
        results.push(result);
      }
    }
    return results;
  }
}

export default {
  Agent,
  AgentSociety,
  MessageBus,
  CollaborationProtocol,
};
