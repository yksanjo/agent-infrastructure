# Core Agent Frameworks

[![npm version](https://img.shields.io/npm/v/core-agent-frameworks.svg)](https://www.npmjs.com/package/core-agent-frameworks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yksanjo/agent-infrastructure)

> Core frameworks for building LLM-powered autonomous agents

## 📦 Included Frameworks

This package provides unified interfaces for:

- **LangChain** - Framework for building LLM applications
- **LlamaIndex** - Data framework for LLM applications (RAG-focused)
- **AutoGen** - Multi-agent conversation framework (Microsoft)
- **CrewAI** - Role-playing autonomous agents framework
- **Haystack** - NLP pipeline framework (deepset)
- **Semantic Kernel** - SDK for integrating LLMs (Microsoft)

## 🚀 Quick Start

```javascript
import { AgentBuilder, ToolRegistry, MemoryManager } from '@agent-infra/core';

// Create an autonomous agent
const agent = new AgentBuilder()
  .withModel('gpt-4')
  .withTools(['search', 'calculator', 'code-interpreter'])
  .withMemory(new MemoryManager({ type: 'vector' }))
  .build();

// Run the agent
const result = await agent.execute('What is the weather in Tokyo?');
console.log(result);
```

## 📚 Documentation

- [Agent Builder API](./docs/agent-builder.md)
- [Tool Registry](./docs/tool-registry.md)
- [Memory Management](./docs/memory.md)

## 🧪 Examples

See the [examples](./examples) directory for complete working examples.

## 📊 Comparison

| Framework | Best For | Multi-Agent | RAG | Tool Use |
|-----------|----------|-------------|-----|----------|
| LangChain | General purpose | ✅ | ✅ | ✅ |
| LlamaIndex | RAG applications | ❌ | ✅ | ✅ |
| AutoGen | Multi-agent conversations | ✅ | ✅ | ✅ |
| CrewAI | Role-playing agents | ✅ | ✅ | ✅ |
| Haystack | NLP pipelines | ❌ | ✅ | ✅ |
| Semantic Kernel | Microsoft ecosystem | ✅ | ✅ | ✅ |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../CONTRIBUTING.md).

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Part of [Agent Infrastructure](../README.md) monorepo**
