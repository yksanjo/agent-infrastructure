# Agent Infrastructure

> 🤖 Complete infrastructure for building production-grade AI agent systems

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yksanjo/agent-infrastructure)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yksanjo/agent-infrastructure/actions)
[![Code Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](https://github.com/yksanjo/agent-infrastructure/coverage)
[![TypeScript](https://img.shields.io/badge/types-included-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

![Agent Infrastructure](https://img.shields.io/badge/Agent-Infrastructure-blue?style=for-the-badge)

---

## 📦 Packages

This monorepo contains 7 comprehensive packages covering the entire agent development stack:

| Package | Description | Version |
|---------|-------------|---------|
| [**core-agent-frameworks**](./core-agent-frameworks) | Core frameworks for building LLM-powered agents | [![npm](https://img.shields.io/npm/v/core-agent-frameworks.svg)](./core-agent-frameworks) |
| [**agent-orchestration**](./agent-orchestration) | Workflow orchestration for multi-agent systems | [![npm](https://img.shields.io/npm/v/agent-orchestration.svg)](./agent-orchestration) |
| [**memory-state-management**](./memory-state-management) | Vector stores and state management | [![npm](https://img.shields.io/npm/v/memory-state-management.svg)](./memory-state-management) |
| [**evaluation-testing**](./evaluation-testing) | Evaluation and testing frameworks | [![npm](https://img.shields.io/npm/v/evaluation-testing.svg)](./evaluation-testing) |
| [**deployment-serving**](./deployment-serving) | Model deployment and serving | [![npm](https://img.shields.io/npm/v/deployment-serving.svg)](./deployment-serving) |
| [**multi-agent-systems**](./multi-agent-systems) | Multi-agent collaboration frameworks | [![npm](https://img.shields.io/npm/v/multi-agent-systems.svg)](./multi-agent-systems) |
| [**tool-use-integration**](./tool-use-integration) | Tool integration and MCP protocol | [![npm](https://img.shields.io/npm/v/tool-use-integration.svg)](./tool-use-integration) |

---

## 🚀 Quick Start

```bash
# Install all packages
npm install

# Run a specific package
cd core-agent-frameworks && npm start

# Run tests
npm test
```

### Example: Building an Autonomous Agent

```javascript
import { AgentBuilder } from '@agent-infra/core';
import { VectorStore } from '@agent-infra/memory';
import { WorkflowEngine } from '@agent-infra/orchestration';

// Create agent with memory
const agent = new AgentBuilder()
  .withModel('gpt-4')
  .withMemory(new VectorStore({ provider: 'chroma' }))
  .build();

// Execute task
const result = await agent.execute('Research AI trends');
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Infrastructure                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Core Agent     │  │   Orchestration  │  │    Memory     │ │
│  │   Frameworks     │  │                  │  │   Management  │ │
│  │                  │  │  - LangGraph     │  │               │ │
│  │  - LangChain     │  │  - Prefect       │  │  - Chroma     │ │
│  │  - AutoGen       │  │  - Airflow       │  │  - Pinecone   │ │
│  │  - CrewAI        │  │  - Dify          │  │  - Weaviate   │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Evaluation     │  │   Deployment     │  │  Multi-Agent  │ │
│  │   & Testing      │  │   & Serving      │  │   Systems     │ │
│  │                  │  │                  │  │               │ │
│  │  - Ragas         │  │  - vLLM          │  │  - AutoGen    │ │
│  │  - LangSmith     │  │  - TGI           │  │  - ChatDev    │ │
│  │  - DeepEval      │  │  - BentoML       │  │  - AgentVerse │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Tool Use & Integration (MCP)                 │ │
│  │         Zapier • n8n • Custom Tools • APIs               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Features

### Core Agent Frameworks
- ✅ Unified interface for major agent frameworks
- ✅ Pluggable tool registry
- ✅ Built-in memory management
- ✅ Event-driven architecture

### Agent Orchestration
- ✅ DAG-based workflow definition
- ✅ Parallel task execution
- ✅ Error handling & retries
- ✅ Real-time monitoring

### Memory & State
- ✅ Multiple vector store backends
- ✅ Semantic search
- ✅ Conversation history
- ✅ State persistence

### Evaluation & Testing
- ✅ Predefined metrics (accuracy, relevance, faithfulness)
- ✅ Test suite management
- ✅ Automated evaluation
- ✅ Performance tracking

### Deployment & Serving
- ✅ One-click deployment
- ✅ Auto-scaling
- ✅ Health monitoring
- ✅ Load balancing

### Multi-Agent Systems
- ✅ Agent society management
- ✅ Message bus communication
- ✅ Collaboration protocols
- ✅ Role-based agents

### Tool Integration
- ✅ Model Context Protocol (MCP)
- ✅ Built-in tools (search, calculator, etc.)
- ✅ Workflow automation (Zapier, n8n)
- ✅ Custom tool creation

---

## 📖 Documentation

| Section | Description |
|---------|-------------|
| [Getting Started](./docs/getting-started.md) | Installation and first steps |
| [Architecture](./docs/architecture.md) | System architecture and design |
| [API Reference](./docs/api.md) | Complete API documentation |
| [Examples](./examples) | Working code examples |
| [Contributing](./CONTRIBUTING.md) | How to contribute |
| [Changelog](./CHANGELOG.md) | Version history |

---

## 🧪 Running Examples

Each package includes working examples:

```bash
# Core agent examples
cd core-agent-frameworks/examples && node basic-agent.js

# Orchestration examples
cd agent-orchestration/examples && node workflow.js

# Multi-agent examples
cd multi-agent-systems/examples && node collaboration.js
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
cd core-agent-frameworks && npm test

# Run with coverage
npm test -- --coverage
```

---

## 📦 Installation

```bash
# Install individual packages
npm install @agent-infra/core
npm install @agent-infra/orchestration
npm install @agent-infra/memory
npm install @agent-infra/evaluation
npm install @agent-infra/deployment
npm install @agent-infra/multi-agent
npm install @agent-infra/tools
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yksanjo/agent-infrastructure.git

# Install dependencies
npm install

# Run in development mode
npm run dev
```

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 👥 Authors

- **Yoshi Kondo** - [yksanjo](https://github.com/yksanjo)

---

## 🙏 Acknowledgments

This project builds upon the amazing work of:
- [LangChain](https://github.com/langchain-ai/langchain)
- [AutoGen](https://github.com/microsoft/autogen)
- [CrewAI](https://github.com/joaomdmoura/crewAI)
- [LlamaIndex](https://github.com/run-llama/llama_index)
- And many other open-source contributors

---

## 📊 Package Health

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/yksanjo/agent-infrastructure/graphs/commit-activity)
[![GitHub Issues](https://img.shields.io/github/issues/yksanjo/agent-infrastructure.svg)](https://github.com/yksanjo/agent-infrastructure/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/yksanjo/agent-infrastructure.svg)](https://github.com/yksanjo/agent-infrastructure/pulls)
[![Stars](https://img.shields.io/github/stars/yksanjo/agent-infrastructure.svg?style=social)](https://github.com/yksanjo/agent-infrastructure/stargazers)

---

<div align="center">

**Built with ❤️ for the AI Agent Community**

[Report Bug](https://github.com/yksanjo/agent-infrastructure/issues) · [Request Feature](https://github.com/yksanjo/agent-infrastructure/issues)

</div>
