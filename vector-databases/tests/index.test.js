/**
 * @jest-environment node
 */

/**
 * Vector Databases Tests
 */

import { MemoryVectorStore, createVectorStore, HybridSearch } from '../src/index.js';

describe('MemoryVectorStore', () => {
  test('should create store with default config', () => {
    const store = new MemoryVectorStore();
    expect(store.provider).toBe('memory');
  });

  test('should add document', async () => {
    const store = new MemoryVectorStore();
    const ids = await store.add({
      id: 'test-1',
      content: 'Test content',
      metadata: { category: 'test' },
    });
    
    expect(ids).toEqual(['test-1']);
  });

  test('should get document by id', async () => {
    const store = new MemoryVectorStore();
    await store.add({ id: 'test-1', content: 'Hello' });
    
    const docs = await store.get('test-1');
    expect(docs.length).toBe(1);
    expect(docs[0].content).toBe('Hello');
  });

  test('should delete document', async () => {
    const store = new MemoryVectorStore();
    await store.add({ id: 'test-1', content: 'Hello' });
    
    await store.delete('test-1');
    const docs = await store.get('test-1');
    expect(docs.length).toBe(0);
  });

  test('should count documents', async () => {
    const store = new MemoryVectorStore();
    await store.add({ id: '1', content: 'First' });
    await store.add({ id: '2', content: 'Second' });
    
    const count = await store.count();
    expect(count).toBe(2);
  });

  test('should reset store', async () => {
    const store = new MemoryVectorStore();
    await store.add({ id: '1', content: 'Test' });
    
    await store.reset();
    const count = await store.count();
    expect(count).toBe(0);
  });

  test('should search with embeddings', async () => {
    const store = new MemoryVectorStore({
      embeddingFn: (text) => {
        // Simple embedding: character codes normalized
        return text.split('').map(c => c.charCodeAt(0) / 256);
      },
    });
    
    await store.add({ id: '1', content: 'Hello world', embedding: [0.5, 0.3, 0.8] });
    await store.add({ id: '2', content: 'Foo bar', embedding: [0.1, 0.9, 0.2] });
    
    const results = await store.similaritySearch([0.5, 0.3, 0.8], { limit: 1 });
    expect(results.matches.length).toBe(1);
    expect(results.matches[0].id).toBe('1');
  });

  test('should filter by metadata', async () => {
    const store = new MemoryVectorStore({
      embeddingFn: (text) => new Array(10).fill(0.1),
    });
    
    await store.add({ id: '1', content: 'A', metadata: { category: 'cat1' }, embedding: new Array(10).fill(0.1) });
    await store.add({ id: '2', content: 'B', metadata: { category: 'cat2' }, embedding: new Array(10).fill(0.1) });
    
    const results = await store.similaritySearch(new Array(10).fill(0.1), {
      limit: 5,
      filter: { category: 'cat1' },
    });
    
    expect(results.matches.length).toBe(1);
    expect(results.matches[0].id).toBe('1');
  });
});

describe('createVectorStore', () => {
  test('should create memory store by default', () => {
    const store = createVectorStore();
    expect(store.provider).toBe('memory');
  });

  test('should create memory store explicitly', () => {
    const store = createVectorStore({ provider: 'memory' });
    expect(store.provider).toBe('memory');
  });

  test('should create chromadb store', () => {
    const store = createVectorStore({ provider: 'chromadb' });
    expect(store.provider).toBe('chromadb');
  });

  test('should create pinecone store', () => {
    const store = createVectorStore({ provider: 'pinecone' });
    expect(store.provider).toBe('pinecone');
  });
});

describe('HybridSearch', () => {
  test('should create hybrid search', () => {
    const store = new MemoryVectorStore();
    const hybrid = new HybridSearch(store);
    
    expect(hybrid.semanticWeight).toBe(0.7);
    expect(hybrid.keywordWeight).toBe(0.3);
  });

  test('should combine semantic and keyword search', async () => {
    const store = new MemoryVectorStore({
      embeddingFn: (text) => new Array(10).fill(0.1),
    });
    
    await store.add({ id: '1', content: 'machine learning', embedding: new Array(10).fill(0.1) });
    await store.add({ id: '2', content: 'cooking recipes', embedding: new Array(10).fill(0.1) });
    
    const hybrid = new HybridSearch(store);
    const results = await hybrid.search('machine learning', { limit: 2 });
    
    expect(results.matches.length).toBe(2);
    expect(results.matches[0].combinedScore).toBeDefined();
  });
});
