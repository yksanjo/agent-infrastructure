# Vector Databases

[![npm version](https://img.shields.io/npm/v/vector-databases.svg)](https://www.npmjs.com/package/vector-databases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Unified interface for vector databases - ChromaDB, Pinecone, Weaviate, Qdrant

## 📦 Supported Databases

| Database | Type | Status |
|----------|------|--------|
| **ChromaDB** | In-memory / Persistent | ✅ Supported |
| **Pinecone** | Managed Cloud | ✅ Supported |
| **Weaviate** | Self-hosted / Cloud | ✅ Supported |
| **Qdrant** | Self-hosted / Cloud | ✅ Supported |
| **Memory** | In-memory (fallback) | ✅ Supported |

## 🚀 Quick Start

```javascript
import { VectorStore, createVectorStore } from '@agent-infra/vector-db';

// Create vector store
const store = createVectorStore({
  provider: 'chromadb',
  collection: 'documents',
  embedding: 'openai', // or provide custom function
});

// Add documents
await store.add({
  id: 'doc-1',
  content: 'Machine learning is a subset of AI',
  metadata: { category: 'AI', year: 2024 }
});

// Add with embeddings (auto-generated)
await store.add({
  id: 'doc-2',
  content: 'Neural networks learn from data',
  metadata: { category: 'Deep Learning' }
});

// Similarity search
const results = await store.similaritySearch('artificial intelligence', {
  limit: 5,
  filter: { category: 'AI' }
});

console.log(results.matches);
```

## 📊 Features

- ✅ Unified interface across providers
- ✅ Automatic embedding generation
- ✅ Metadata filtering
- ✅ Hybrid search (semantic + keyword)
- ✅ Batch operations
- ✅ Collection management
- ✅ Persistence options
- ✅ Cosine, L2, dot product similarity

## 🔧 Configuration

```javascript
// ChromaDB (Local)
const chroma = createVectorStore({
  provider: 'chromadb',
  path: 'http://localhost:8000',
  collection: 'my-collection',
});

// Pinecone (Cloud)
const pinecone = createVectorStore({
  provider: 'pinecone',
  apiKey: process.env.PINECONE_API_KEY,
  environment: 'us-west1-gcp',
  index: 'my-index',
});

// Weaviate
const weaviate = createVectorStore({
  provider: 'weaviate',
  baseUrl: 'http://localhost:8080',
  className: 'Document',
});

// Qdrant
const qdrant = createVectorStore({
  provider: 'qdrant',
  url: 'http://localhost:6333',
  collection: 'documents',
});
```

## 📝 License

MIT License
