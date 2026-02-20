/**
 * LLM Providers Example
 * Demonstrates using OpenAI, Anthropic, and Ollama
 */

import { createProvider, MultiProvider } from '../src/index.js';

async function main() {
  console.log('🤖 LLM Providers Demo\n');

  // Create providers
  console.log('1. Creating providers...\n');
  
  const openai = createProvider({
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY || 'demo-key',
  });

  const anthropic = createProvider({
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    apiKey: process.env.ANTHROPIC_API_KEY || 'demo-key',
  });

  const ollama = createProvider({
    provider: 'ollama',
    model: 'llama2',
    baseUrl: 'http://localhost:11434',
  });

  // Event listeners
  openai.on('usage', (usage) => {
    console.log(`   📊 Tokens: ${usage.total_tokens}`);
  });

  openai.on('rate-limit', ({ attempt, delay }) => {
    console.log(`   ⏳ Rate limited, retrying in ${delay}ms...`);
  });

  // Test OpenAI
  console.log('2. Testing OpenAI...\n');
  try {
    const response = await openai.chat([
      { role: 'user', content: 'What is 2 + 2? Answer in one word.' }
    ]);
    console.log(`   OpenAI: ${response.content}`);
    console.log(`   Model: ${response.model}`);
  } catch (error) {
    console.log(`   OpenAI: (API key required) ${error.message}`);
  }

  // Test Anthropic
  console.log('\n3. Testing Anthropic...\n');
  try {
    const response = await anthropic.chat([
      { role: 'user', content: 'What is 2 + 2? Answer in one word.' }
    ]);
    console.log(`   Anthropic: ${response.content}`);
    console.log(`   Model: ${response.model}`);
  } catch (error) {
    console.log(`   Anthropic: (API key required) ${error.message}`);
  }

  // Test Ollama
  console.log('\n4. Testing Ollama (Local)...\n');
  try {
    const response = await ollama.chat([
      { role: 'user', content: 'What is 2 + 2? Answer in one word.' }
    ]);
    console.log(`   Ollama: ${response.content}`);
    console.log(`   Model: ${response.model}`);
  } catch (error) {
    console.log(`   Ollama: (Requires Ollama running) ${error.message}`);
  }

  // Multi-provider fallback
  console.log('\n5. Testing Multi-Provider Fallback...\n');
  const multi = new MultiProvider([openai, anthropic, ollama]);

  multi.on('trying', ({ provider }) => {
    console.log(`   → Trying ${provider}...`);
  });

  multi.on('success', ({ provider }) => {
    console.log(`   ✓ Success with ${provider}`);
  });

  multi.on('failed', ({ provider, error }) => {
    console.log(`   ✗ Failed ${provider}: ${error}`);
  });

  try {
    const response = await multi.chat([
      { role: 'user', content: 'Hello!' }
    ]);
    console.log(`   Response: ${response.content}`);
  } catch (error) {
    console.log(`   All providers failed: ${error.message}`);
  }

  // Token counting
  console.log('\n6. Token Counting...\n');
  const text = 'The quick brown fox jumps over the lazy dog';
  const tokens = await openai.countTokens(text);
  console.log(`   Text: "${text}"`);
  console.log(`   Estimated tokens: ${tokens}`);

  // Cost estimation
  console.log('\n7. Cost Estimation...\n');
  const usage = { input: 1000, output: 500 };
  const cost = openai.estimateCost(usage, 'gpt-4-turbo');
  console.log(`   Input tokens: ${usage.input}`);
  console.log(`   Output tokens: ${usage.output}`);
  console.log(`   Estimated cost: $${cost.total.toFixed(4)}`);

  // List models
  console.log('\n8. Available Models...\n');
  const models = await ollama.listModels();
  console.log(`   Ollama models: ${models.length > 0 ? models.map(m => m.id).join(', ') : 'None (start Ollama first)'}`);
}

main().catch(console.error);
