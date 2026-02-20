/**
 * Vector Database Example
 * Demonstrates ChromaDB, Pinecone, and in-memory vector stores
 */

import { createVectorStore, HybridSearch } from '../src/index.js';

// Simple embedding function (for demo - use real embeddings in production)
function simpleEmbedding(text) {
  // Create a simple hash-based embedding (NOT for production use)
  const dim = 128;
  const embedding = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    embedding[i % dim] += text.charCodeAt(i) / 256;
  }
  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map(v => v / norm);
}

async function main() {
  console.log('📚 Vector Databases Demo\n');

  // 1. In-Memory Vector Store
  console.log('1. In-Memory Vector Store\n');
  
  const memoryStore = createVectorStore({
    provider: 'memory',
    collection: 'demo',
    embeddingFn: simpleEmbedding,
  });

  // Add documents
  const docs = [
    { id: '1', content: 'Machine learning is a subset of artificial intelligence', metadata: { category: 'AI', year: 2024 } },
    { id: '2', content: 'Neural networks are inspired by biological neurons', metadata: { category: 'Deep Learning', year: 2023 } },
    { id: '3', content: 'Python is popular for data science and ML', metadata: { category: 'Programming', year: 2024 } },
    { id: '4', content: 'Transformers revolutionized NLP tasks', metadata: { category: 'NLP', year: 2023 } },
    { id: '5', content: 'Reinforcement learning uses rewards and penalties', metadata: { category: 'AI', year: 2024 } },
  ];

  console.log('Adding documents...');
  await memoryStore.add(docs);
  console.log(`✓ Added ${docs.length} documents\n`);

  // Count
  const count = await memoryStore.count();
  console.log(`Total documents: ${count}\n`);

  // Similarity search
  console.log('Searching for "artificial intelligence"...');
  const results = await memoryStore.similaritySearch('artificial intelligence', { limit: 3 });
  console.log('Results:');
  results.matches.forEach((match, i) => {
    console.log(`  ${i + 1}. [Score: ${match.score.toFixed(3)}] ${match.content}`);
  });
  console.log();

  // Filtered search
  console.log('Searching with filter (category: AI)...');
  const filtered = await memoryStore.similaritySearch('learning', {
    limit: 5,
    filter: { category: 'AI' }
  });
  console.log('Results:');
  filtered.matches.forEach((match, i) => {
    console.log(`  ${i + 1}. [Score: ${match.score.toFixed(3)}] ${match.content}`);
  });
  console.log();

  // 2. Hybrid Search
  console.log('2. Hybrid Search (Semantic + Keyword)\n');
  
  const hybridSearch = new HybridSearch(memoryStore, {
    semanticWeight: 0.7,
    keywordWeight: 0.3,
  });

  const hybridResults = await hybridSearch.search('machine learning Python', { limit: 3 });
  console.log('Results:');
  hybridResults.matches.forEach((match, i) => {
    console.log(`  ${i + 1}. [Score: ${match.combinedScore.toFixed(3)}] ${match.content}`);
  });
  console.log();

  // 3. Get specific documents
  console.log('3. Get Documents by ID\n');
  const retrieved = await memoryStore.get(['1', '3']);
  retrieved.forEach(doc => {
    console.log(`  ID ${doc.id}: ${doc.content}`);
  });
  console.log();

  // 4. Update document
  console.log('4. Update Document\n');
  await memoryStore.update('1', {
    content: 'Machine learning (ML) is a subset of artificial intelligence',
    metadata: { category: 'AI', year: 2024, updated: true }
  });
  const updated = await memoryStore.get('1');
  console.log(`  Updated: ${updated[0].content}`);
  console.log();

  // 5. Delete document
  console.log('5. Delete Document\n');
  await memoryStore.delete('5');
  const newCount = await memoryStore.count();
  console.log(`  Documents after deletion: ${newCount}`);
  console.log();

  // 6. ChromaDB (if available)
  console.log('6. ChromaDB Connection Test\n');
  const chromaStore = createVectorStore({
    provider: 'chromadb',
    path: 'http://localhost:8000',
    collection: 'test',
    embeddingFn: simpleEmbedding,
  });

  try {
    const connected = await chromaStore.connect();
    if (connected) {
      console.log('  ✓ Connected to ChromaDB');
      await chromaStore.add({ content: 'Test document', metadata: { source: 'demo' } });
      const chromaCount = await chromaStore.count();
      console.log(`  Documents in ChromaDB: ${chromaCount}`);
    } else {
      console.log('  ChromaDB not available (start with: docker run -p 8000:8000 chromadb/chroma)');
    }
  } catch (error) {
    console.log(`  ChromaDB not available: ${error.message}`);
  }
  console.log();

  // 7. Pinecone (if configured)
  console.log('7. Pinecone Connection Test\n');
  if (process.env.PINECONE_API_KEY) {
    const pineconeStore = createVectorStore({
      provider: 'pinecone',
      apiKey: process.env.PINECONE_API_KEY,
      environment: 'us-west1-gcp',
      index: 'demo',
      embeddingFn: simpleEmbedding,
    });

    try {
      const connected = await pineconeStore.connect();
      if (connected) {
        console.log('  ✓ Connected to Pinecone');
        const pcCount = await pineconeStore.count();
        console.log(`  Documents in Pinecone: ${pcCount}`);
      }
    } catch (error) {
      console.log(`  Pinecone error: ${error.message}`);
    }
  } else {
    console.log('  PINECONE_API_KEY not set (skipping Pinecone test)');
  }
  console.log();

  console.log('✅ Demo complete!');
}

main().catch(console.error);
