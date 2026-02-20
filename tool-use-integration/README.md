# Tool Use & Integration

[![npm version](https://img.shields.io/npm/v/tool-use-integration.svg)](https://www.npmjs.com/package/tool-use-integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Tool integration and MCP protocol implementation for AI agents

## 📦 Supported Integrations

- **Model Context Protocol (MCP)** - Standard for AI tool connections
- **Zapier AI** - Workflow automation integration
- **n8n** - Workflow automation with AI nodes

## 🚀 Quick Start

```javascript
import { ToolRegistry, MCPClient, WorkflowConnector } from '@agent-infra/tools';

// Create tool registry
const registry = new ToolRegistry();

// Register tools
registry.register('search', {
  description: 'Search the web',
  execute: async (query) => {/* ... */}
});

registry.register('calculator', {
  description: 'Perform calculations',
  execute: async (expression) => {/* ... */}
});

// Use with agent
const tools = registry.list();
const result = await registry.execute('calculator', '2 + 2');
```

## 🛠️ Built-in Tools

| Tool | Description | Category |
|------|-------------|----------|
| Search | Web search | Information |
| Calculator | Math operations | Utility |
| File System | Read/write files | System |
| HTTP Client | API calls | Network |
| Code Executor | Run code snippets | Execution |
| Database | Query databases | Data |

## 📝 License

MIT License
