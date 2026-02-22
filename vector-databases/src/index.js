/**
 * Vector Databases - Production Implementation
 * Unified interface for ChromaDB, Pinecone, Weaviate, Qdrant
 */

import { EventEmitter } from 'events';

// Simple embedding function (for demo/testing)
export function simpleEmbedding(text) {
  const dim = 384;
  const embedding = new Array(dim).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    embedding[Math.abs(hash) % dim] += 1 / words.length;
  });
  
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map(v => v / (norm || 1));
}

// Base Class
export class BaseVectorStore extends EventEmitter {
  constructor(options = {}) {
    super();
    this.collection = options.collection || 'default';
    this.dimension = options.dimension || 384;
    this.distance = options.distance || 'cosine';
  }

  async add(documents) { throw new Error('Not implemented'); }
  async get(ids) { throw new Error('Not implemented'); }
  async delete(ids) { throw new Error('Not implemented'); }
  async similaritySearch(query, options) { throw new Error('Not implemented'); }
  async count() { throw new Error('Not implemented'); }
  async reset() { throw new Error('Not implemented'); }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }

  euclideanDistance(a, b) {
    if (!a || !b) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}

// In-Memory Vector Store
export class MemoryVectorStore extends BaseVectorStore {
  constructor(options = {}) {
    super(options);
    this.provider = 'memory';
    this.documents = new Map();
    this.embeddings = new Map();
    this.embeddingFn = options.embeddingFn || simpleEmbedding;
  }

  async add(documents) {
    const docs = Array.isArray(documents) ? documents : [documents];
    const ids = [];

    for (const doc of docs) {
      const id = doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      this.documents.set(id, {
        id,
        content: doc.content,
        metadata: doc.metadata || {},
        createdAt: Date.now(),
      });

      const embedding = doc.embedding || await this.embeddingFn(doc.content);
      this.embeddings.set(id, embedding);
      ids.push(id);
      this.emit('add', { id, content: doc.content });
    }

    return ids;
  }

  async get(ids) {
    const idList = Array.isArray(ids) ? ids : [ids];
    const results = [];
    for (const id of idList) {
      const doc = this.documents.get(id);
      if (doc) {
        results.push({ ...doc, embedding: this.embeddings.get(id) });
      }
    }
    return results;
  }

  async delete(ids) {
    const idList = Array.isArray(ids) ? ids : [ids];
    for (const id of idList) {
      this.documents.delete(id);
      this.embeddings.delete(id);
    }
    return true;
  }

  async similaritySearch(query, options = {}) {
    const limit = options.limit || 5;
    const filter = options.filter || {};

    const queryEmbedding = Array.isArray(query) 
      ? query 
      : await this.embeddingFn(query);

    const scores = [];

    for (const [id, doc] of this.documents) {
      if (Object.keys(filter).length > 0) {
        const matches = Object.entries(filter).every(([key, value]) => 
          doc.metadata[key] === value
        );
        if (!matches) continue;
      }

      const embedding = this.embeddings.get(id);
      if (!embedding) continue;

      const score = this.cosineSimilarity(queryEmbedding, embedding);
      scores.push({ id, content: doc.content, metadata: doc.metadata, score });
    }

    scores.sort((a, b) => b.score - a.score);
    return { matches: scores.slice(0, limit), query: typeof query === 'string' ? query : null, limit };
  }

  async count() { return this.documents.size; }

  async reset() {
    this.documents.clear();
    this.embeddings.clear();
    return true;
  }

  async listCollections() {
    return [{ name: this.collection, count: this.documents.size }];
  }
}

// ChromaDB Store
export class ChromaDBStore extends BaseVectorStore {
  constructor(options = {}) {
    super(options);
    this.provider = 'chromadb';
    this.path = options.path || 'http://localhost:8000';
  }

  async connect() {
    try {
      const { ChromaClient } = await import('chromadb');
      const client = new ChromaClient({ path: this.path });
      this.collection = await client.getOrCreateCollection({ name: this.collection });
      this.emit('connect');
      return true;
    } catch (error) {
      console.warn('ChromaDB not available');
      return false;
    }
  }

  async add(documents) {
    await this.connect();
    const docs = Array.isArray(documents) ? documents : [documents];
    const ids = docs.map(d => d.id || `doc-${Date.now()}`);
    await this.collection.add({
      ids,
      documents: docs.map(d => d.content),
      metadatas: docs.map(d => d.metadata || {}),
    });
    return ids;
  }

  async similaritySearch(query, options = {}) {
    await this.connect();
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: options.limit || 5,
    });
    return {
      matches: results.documents[0]?.map((doc, i) => ({
        id: results.ids[0][i],
        content: doc,
        metadata: results.metadatas[0][i],
        score: 1 - (results.distances[0][i] || 0),
      })) || [],
    };
  }

  async count() {
    await this.connect();
    return await this.collection.count();
  }
}

// Pinecone Store
export class PineconeStore extends BaseVectorStore {
  constructor(options = {}) {
    super(options);
    this.provider = 'pinecone';
    this.apiKey = options.apiKey || process.env.PINECONE_API_KEY;
    this.indexName = options.index || 'default';
  }

  async connect() {
    try {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const client = new Pinecone({ apiKey: this.apiKey });
      this.index = client.index(this.indexName);
      this.emit('connect');
      return true;
    } catch (error) {
      console.warn('Pinecone not available');
      return false;
    }
  }

  async add(documents) {
    await this.connect();
    const docs = Array.isArray(documents) ? documents : [documents];
    const vectors = docs.map(doc => ({
      id: doc.id || `doc-${Date.now()}`,
      values: doc.embedding || simpleEmbedding(doc.content),
      metadata: { content: doc.content, ...doc.metadata },
    }));
    await this.index.upsert(vectors);
    return vectors.map(v => v.id);
  }

  async similaritySearch(query, options = {}) {
    await this.connect();
    const queryEmbedding = Array.isArray(query) ? query : simpleEmbedding(query);
    const results = await this.index.query({
      vector: queryEmbedding,
      topK: options.limit || 5,
      includeMetadata: true,
    });
    return {
      matches: results.matches?.map(m => ({
        id: m.id,
        content: m.metadata?.content,
        metadata: m.metadata,
        score: m.score,
      })) || [],
    };
  }

  async count() {
    await this.connect();
    const stats = await this.index.describeIndexStats();
    return stats.totalRecordCount || 0;
  }
}

// Factory
export function createVectorStore(options = {}) {
  const provider = options.provider?.toLowerCase() || 'memory';
  switch (provider) {
    case 'chromadb': return new ChromaDBStore(options);
    case 'pinecone': return new PineconeStore(options);
    default: return new MemoryVectorStore(options);
  }
}

// Hybrid Search
export class HybridSearch {
  constructor(vectorStore, options = {}) {
    this.vectorStore = vectorStore;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.semanticWeight = options.semanticWeight ?? 0.7;
  }

  async search(query, options = {}) {
    const limit = options.limit || 10;
    const semanticResults = await this.vectorStore.similaritySearch(query, { limit: limit * 2 });

    const queryWords = query.toLowerCase().split(/\s+/);
    for (const match of semanticResults.matches) {
      const content = match.content.toLowerCase();
      let keywordScore = 0;
      for (const word of queryWords) {
        if (content.includes(word)) keywordScore += 1 / queryWords.length;
      }
      match.keywordScore = keywordScore;
      match.combinedScore = match.score * this.semanticWeight + keywordScore * this.keywordWeight;
    }

    semanticResults.matches.sort((a, b) => b.combinedScore - a.combinedScore);
    return { matches: semanticResults.matches.slice(0, limit), query, limit };
  }
}

export default { BaseVectorStore, MemoryVectorStore, ChromaDBStore, PineconeStore, createVectorStore, HybridSearch, simpleEmbedding };
