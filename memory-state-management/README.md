# Memory & State Management

[![npm version](https://img.shields.io/npm/v/memory-state-management.svg)](https://www.npmjs.com/package/memory-state-management)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Memory and state management for AI agents with vector store support

## 📦 Supported Backends

- **Chroma** - Vector database for AI memory
- **Pinecone** - Managed vector database
- **Weaviate** - Vector search engine
- **Qdrant** - Vector similarity search engine
- **Redis** - In-memory store for agent state

## 🚀 Quick Start

```javascript
import { VectorStore, AgentState, ConversationMemory } from '@agent-infra/memory';

// Initialize vector store
const store = new VectorStore({
  provider: 'chroma',
  collection: 'agent-memory'
});

// Store embeddings
await store.add({
  id: 'conv-1',
  content: 'User prefers dark mode',
  metadata: { userId: 'user-123' }
});

// Search
const results = await store.similaritySearch('UI preferences', { limit: 5 });
```

## 📊 Features

- 🔍 Semantic search with embeddings
- 💾 Persistent conversation history
- 🔄 State synchronization
- 📦 Multiple vector store backends
- ⚡ High-performance retrieval

## 📝 License

MIT License
