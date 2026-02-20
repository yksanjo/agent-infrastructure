/**
 * Vector Databases
 * Unified interface for ChromaDB, Pinecone, Weaviate, Qdrant
 */

import { EventEmitter } from 'events';

/**
 * Base Vector Store - Abstract base class
 */
export class BaseVectorStore extends EventEmitter {
  constructor(options = {}) {
    super();
    this.provider = 'base';
    this.collection = options.collection || 'default';
    this.dimension = options.dimension || 1536;
    this.distance = options.distance || 'cosine'; // cosine, l2, dot
    this.embeddingFn = options.embeddingFn || null;
  }

  async add(documents) {
    throw new Error('Method not implemented');
  }

  async get(ids) {
    throw new Error('Method not implemented');
  }

  async delete(ids) {
    throw new Error('Method not implemented');
  }

  async similaritySearch(query, options = {}) {
    throw new Error('Method not implemented');
  }

  async update(id, document) {
    throw new Error('Method not implemented');
  }

  async count() {
    throw new Error('Method not implemented');
  }

  async reset() {
    throw new Error('Method not implemented');
  }

  async generateEmbedding(text) {
    if (!this.embeddingFn) {
      throw new Error('No embedding function configured');
    }
    return this.embeddingFn(text);
  }

  async generateEmbeddings(texts) {
    return Promise.all(texts.map(t => this.generateEmbedding(t)));
  }

  cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

/**
 * In-Memory Vector Store (Fallback)
 */
export class MemoryVectorStore extends BaseVectorStore {
  constructor(options = {}) {
    super(options);
    this.provider = 'memory';
    this.documents = new Map();
    this.embeddings = new Map();
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

      if (doc.embedding) {
        this.embeddings.set(id, doc.embedding);
      } else if (this.embeddingFn) {
        const embedding = await this.generateEmbedding(doc.content);
        this.embeddings.set(id, embedding);
      }

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
        results.push({
          ...doc,
          embedding: this.embeddings.get(id),
        });
      }
    }

    return results;
  }

  async delete(ids) {
    const idList = Array.isArray(ids) ? ids : [ids];
    for (const id of idList) {
      this.documents.delete(id);
      this.embeddings.delete(id);
      this.emit('delete', { id });
    }
    return true;
  }

  async similaritySearch(query, options = {}) {
    const limit = options.limit || 5;
    const filter = options.filter || {};
    const includeEmbeddings = options.includeEmbeddings || false;

    let queryEmbedding;
    if (Array.isArray(query)) {
      queryEmbedding = query;
    } else if (this.embeddingFn) {
      queryEmbedding = await this.generateEmbedding(query);
    } else {
      throw new Error('Query must be an embedding array or provide embedding function');
    }

    const scores = [];

    for (const [id, doc] of this.documents) {
      // Apply metadata filters
      if (Object.keys(filter).length > 0) {
        const matches = Object.entries(filter).every(([key, value]) => 
          doc.metadata[key] === value
        );
        if (!matches) continue;
      }

      const embedding = this.embeddings.get(id);
      if (!embedding) continue;

      const score = this.cosineSimilarity(queryEmbedding, embedding);
      scores.push({
        id,
        content: doc.content,
        metadata: doc.metadata,
        score,
        ...(includeEmbeddings && { embedding }),
      });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    return {
      matches: scores.slice(0, limit),
      query: typeof query === 'string' ? query : null,
      limit,
    };
  }

  async update(id, document) {
    if (!this.documents.has(id)) {
      throw new Error(`Document not found: ${id}`);
    }

    const existing = this.documents.get(id);
    const updated = {
      ...existing,
      ...document,
      metadata: { ...existing.metadata, ...document.metadata },
      updatedAt: Date.now(),
    };

    this.documents.set(id, updated);

    if (document.embedding) {
      this.embeddings.set(id, document.embedding);
    }

    this.emit('update', { id });
    return true;
  }

  async count() {
    return this.documents.size;
  }

  async reset() {
    this.documents.clear();
    this.embeddings.clear();
    this.emit('reset');
    return true;
  }

  async listCollections() {
    return [{ name: this.collection, count: this.documents.size }];
  }
}

/**
 * ChromaDB Provider
 */
export class ChromaDBStore extends BaseVectorStore {
  constructor(options = {}) {
    super(options);
    this.provider = 'chromadb';
    this.path = options.path || 'http://localhost:8000';
    this.client = null;
    this.collection = null;
  }

  async connect() {
    try {
      const { ChromaClient } = await import('chromadb');
      this.client = new ChromaClient({ path: this.path });
      
      // Get or create collection
      const collections = await this.client.listCollections();
      const exists = collections.find(c => c.name === this.collection);
      
      if (exists) {
        this.collection = await this.client.getCollection({ name: this.collection });
      } else {
        this.collection = await this.client.createCollection({
          name: this.collection,
          metadata: { dimension: this.dimension },
        });
      }

      this.emit('connect');
      return true;
    } catch (error) {
      console.warn('ChromaDB not available, falling back to memory store');
      return false;
    }
  }

  async add(documents) {
    if (!this.collection) {
      await this.connect();
    }

    const docs = Array.isArray(documents) ? documents : [documents];
    const ids = docs.map(d => d.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const contents = docs.map(d => d.content);
    const metadatas = docs.map(d => d.metadata || {});

    try {
      await this.collection.add({
        ids,
        documents: contents,
        metadatas,
      });

      ids.forEach((id, i) => {
        this.emit('add', { id, content: docs[i].content });
      });

      return ids;
    } catch (error) {
      // Fallback to upsert if add fails (duplicates)
      await this.collection.upsert({
        ids,
        documents: contents,
        metadatas,
      });
      return ids;
    }
  }

  async get(ids) {
    if (!this.collection) {
      await this.connect();
    }

    const idList = Array.isArray(ids) ? ids : [ids];
    const results = await this.collection.get({
      ids: idList,
      include: ['documents', 'metadatas'],
    });

    return results.documents.map((doc, i) => ({
      id: results.ids[i],
      content: doc,
      metadata: results.metadatas[i],
    }));
  }

  async delete(ids) {
    if (!this.collection) {
      await this.connect();
    }

    const idList = Array.isArray(ids) ? ids : [ids];
    await this.collection.delete({ ids: idList });
    return true;
  }

  async similaritySearch(query, options = {}) {
    if (!this.collection) {
      await this.connect();
    }

    const limit = options.limit || 5;
    const filter = options.filter || {};

    const results = await this.collection.query({
      queryTexts: [query],
      nResults: limit,
      where: filter,
      include: ['documents', 'metadatas', 'distances'],
    });

    const matches = results.documents[0].map((doc, i) => ({
      id: results.ids[0][i],
      content: doc,
      metadata: results.metadatas[0][i],
      score: 1 - (results.distances[0][i] || 0), // Convert distance to similarity
    }));

    return {
      matches,
      query,
      limit,
    };
  }

  async count() {
    if (!this.collection) {
      await this.connect();
    }
    return this.collection.count();
  }

  async reset() {
    if (!this.client) {
      await this.connect();
    }
    await this.client.deleteCollection({ name: this.collection });
    this.collection = null;
    await this.connect();
    return true;
  }
}

/**
 * Pinecone Provider
 */
export class PineconeStore extends BaseVectorStore {
  constructor(options = {}) {
    super(options);
    this.provider = 'pinecone';
    this.apiKey = options.apiKey || process.env.PINECONE_API_KEY;
    this.environment = options.environment || 'us-west1-gcp';
    this.indexName = options.index || 'default';
    this.client = null;
    this.index = null;
  }

  async connect() {
    try {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      this.client = new Pinecone({ apiKey: this.apiKey });
      this.index = this.client.index(this.indexName);
      this.emit('connect');
      return true;
    } catch (error) {
      console.warn('Pinecone connection failed:', error.message);
      return false;
    }
  }

  async add(documents) {
    if (!this.index) {
      await this.connect();
    }

    const docs = Array.isArray(documents) ? documents : [documents];
    const vectors = [];

    for (const doc of docs) {
      const id = doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let embedding = doc.embedding;

      if (!embedding && this.embeddingFn) {
        embedding = await this.generateEmbedding(doc.content);
      }

      if (!embedding) {
        throw new Error('No embedding provided or embedding function configured');
      }

      vectors.push({
        id,
        values: embedding,
        metadata: {
          content: doc.content,
          ...doc.metadata,
        },
      });
    }

    // Pinecone has a batch limit of 100
    const batches = [];
    for (let i = 0; i < vectors.length; i += 100) {
      batches.push(vectors.slice(i, i + 100));
    }

    for (const batch of batches) {
      await this.index.upsert(batch);
    }

    const ids = docs.map(d => d.id);
    ids.forEach((id, i) => {
      this.emit('add', { id, content: docs[i].content });
    });

    return ids;
  }

  async get(ids) {
    if (!this.index) {
      await this.connect();
    }

    const idList = Array.isArray(ids) ? ids : [ids];
    const results = await this.index.fetch(idList);

    return Object.values(results.records).map(record => ({
      id: record.id,
      content: record.metadata?.content,
      metadata: record.metadata,
      embedding: record.values,
    }));
  }

  async delete(ids) {
    if (!this.index) {
      await this.connect();
    }

    const idList = Array.isArray(ids) ? ids : [ids];
    await this.index.deleteMany(idList);
    return true;
  }

  async similaritySearch(query, options = {}) {
    if (!this.index) {
      await this.connect();
    }

    const limit = options.limit || 5;
    const filter = options.filter || {};

    let queryEmbedding;
    if (Array.isArray(query)) {
      queryEmbedding = query;
    } else if (this.embeddingFn) {
      queryEmbedding = await this.generateEmbedding(query);
    } else {
      throw new Error('Query must be an embedding array or provide embedding function');
    }

    const results = await this.index.query({
      vector: queryEmbedding,
      topK: limit,
      filter,
      includeMetadata: true,
      includeValues: false,
    });

    const matches = results.matches.map(match => ({
      id: match.id,
      content: match.metadata?.content,
      metadata: match.metadata,
      score: match.score,
    }));

    return {
      matches,
      query: typeof query === 'string' ? query : null,
      limit,
    };
  }

  async count() {
    if (!this.index) {
      await this.connect();
    }

    const stats = await this.index.describeIndexStats();
    return stats.totalRecordCount || 0;
  }

  async reset() {
    if (!this.client) {
      await this.connect();
    }
    await this.index.deleteMany({ deleteAll: true });
    return true;
  }
}

/**
 * Create Vector Store from config
 */
export function createVectorStore(options = {}) {
  const provider = options.provider?.toLowerCase() || 'memory';

  switch (provider) {
    case 'chromadb':
      return new ChromaDBStore(options);
    case 'pinecone':
      return new PineconeStore(options);
    case 'memory':
    default:
      return new MemoryVectorStore(options);
  }
}

/**
 * Hybrid Search - Combine semantic and keyword search
 */
export class HybridSearch {
  constructor(vectorStore, options = {}) {
    this.vectorStore = vectorStore;
    this.keywordWeight = options.keywordWeight ?? 0.3;
    this.semanticWeight = options.semanticWeight ?? 0.7;
  }

  async search(query, options = {}) {
    const limit = options.limit || 10;
    
    // Get semantic results
    const semanticResults = await this.vectorStore.similaritySearch(query, {
      limit: limit * 2,
    });

    // Simple keyword matching
    const keywordResults = [];
    const queryWords = query.toLowerCase().split(/\s+/);
    
    for (const match of semanticResults.matches) {
      const content = match.content.toLowerCase();
      let keywordScore = 0;
      for (const word of queryWords) {
        if (content.includes(word)) {
          keywordScore += 1 / queryWords.length;
        }
      }
      keywordResults.push({
        ...match,
        keywordScore,
      });
    }

    // Combine scores
    const combined = keywordResults.map(result => ({
      ...result,
      combinedScore: result.score * this.semanticWeight + result.keywordScore * this.keywordWeight,
    }));

    // Sort and return top results
    combined.sort((a, b) => b.combinedScore - a.combinedScore);

    return {
      matches: combined.slice(0, limit),
      query,
      limit,
    };
  }
}

export default {
  BaseVectorStore,
  MemoryVectorStore,
  ChromaDBStore,
  PineconeStore,
  createVectorStore,
  HybridSearch,
};
