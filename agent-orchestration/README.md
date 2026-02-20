# Agent Orchestration

[![npm version](https://img.shields.io/npm/v/agent-orchestration.svg)](https://www.npmjs.com/package/agent-orchestration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Workflow orchestration for multi-agent systems and AI pipelines

## 📦 Included Tools

- **LangGraph** - Stateful, multi-actor workflows
- **Prefect** - Workflow orchestration for data/AI pipelines
- **Airflow** - General workflow orchestration
- **Dify** - LLMOps platform for agent deployment
- **Flowise** - Drag-and-drop UI for LLM flows

## 🚀 Quick Start

```javascript
import { WorkflowEngine, TaskQueue, AgentPool } from '@agent-infra/orchestration';

// Create a workflow
const workflow = new WorkflowEngine()
  .addTask('research', async () => {/* ... */})
  .addTask('analyze', async (data) => {/* ... */})
  .addTask('report', async (analysis) => {/* ... */});

// Execute with dependencies
await workflow.execute({
  dependencies: {
    'analyze': ['research'],
    'report': ['analyze']
  }
});
```

## 📊 Features

- ⚡ Parallel task execution
- 🔄 DAG-based workflow definition
- 📈 Real-time monitoring
- 🛠️ Error handling & retries
- 💾 State persistence

## 📝 License

MIT License
