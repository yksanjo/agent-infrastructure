/**
 * Memory Example
 * Demonstrates vector store and conversation memory
 */

import { VectorStore, AgentState, ConversationMemory } from '../src/index.js';

async function main() {
  console.log('💾 Agent Infrastructure - Memory Example\n');

  // Vector Store
  console.log('📚 Vector Store:');
  const store = new VectorStore({ provider: 'chroma' });

  await store.add({
    id: 'doc-1',
    content: 'Machine learning is a subset of AI',
    metadata: { category: 'AI' },
  });

  await store.add({
    id: 'doc-2',
    content: 'Neural networks are inspired by the brain',
    metadata: { category: 'Deep Learning' },
  });

  console.log(`  Added 2 documents`);
  console.log(`  Total: ${await store.count()}\n`);

  // Search
  console.log('🔍 Searching for "AI":');
  const results = await store.similaritySearch('AI', { limit: 5 });
  console.log(`  Found ${results.matches.length} matches\n`);

  // Conversation Memory
  console.log('💬 Conversation Memory:');
  const memory = new ConversationMemory({ maxMessages: 10 });

  memory.add({ role: 'user', content: 'What is TypeScript?' });
  memory.add({ role: 'assistant', content: 'TypeScript is a typed superset of JavaScript' });
  memory.add({ role: 'user', content: 'How do I install it?' });
  memory.add({ role: 'assistant', content: 'npm install -g typescript' });

  console.log(`  Total messages: ${memory.getSummary().totalMessages}`);
  console.log('  Last 2 messages:');
  memory.get(2).forEach(msg => {
    console.log(`    ${msg.role}: ${msg.content}`);
  });

  // Agent State
  console.log('\n🔧 Agent State:');
  const state = new AgentState();
  await state.set('user-preference', 'dark-mode');
  await state.set('session-count', 5);

  const preference = await state.get('user-preference');
  console.log(`  User preference: ${preference}`);
  console.log(`  State keys: ${await state.keys()}`);
}

main().catch(console.error);
