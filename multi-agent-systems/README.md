# Multi-Agent Systems

[![npm version](https://img.shields.io/npm/v/multi-agent-systems.svg)](https://www.npmjs.com/package/multi-agent-systems)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Multi-agent collaboration and communication frameworks

## 📦 Included Frameworks

- **AutoGen** - Conversable agents
- **ChatDev** - Software development agents
- **AgentVerse** - Multi-agent simulation
- **Camel** - Communicative agents framework

## 🚀 Quick Start

```javascript
import { AgentSociety, MessageBus, CollaborationProtocol } from '@agent-infra/multi-agent';

// Create agent society
const society = new AgentSociety();

// Add specialized agents
society.addAgent('researcher', { role: 'research', tools: ['search'] });
society.addAgent('analyst', { role: 'analysis', tools: ['calculator'] });
society.addAgent('writer', { role: 'writing', tools: ['document'] });

// Start collaboration
const result = await society.collaborate({
  task: 'Research and write a report on AI trends',
  protocol: 'round-robin'
});
```

## 📊 Agent Roles

| Role | Description | Tools |
|------|-------------|-------|
| Researcher | Information gathering | Search, Browse |
| Analyst | Data analysis | Calculator, Charts |
| Writer | Content creation | Document, Editor |
| Reviewer | Quality assurance | Critique, Validate |
| Coordinator | Task orchestration | Plan, Delegate |

## 📝 License

MIT License
