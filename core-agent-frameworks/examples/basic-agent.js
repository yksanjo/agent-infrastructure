/**
 * Basic Agent Example
 * Demonstrates creating and running an autonomous agent
 */

import { AgentBuilder, ToolRegistry, MemoryManager } from '../src/index.js';

async function main() {
  console.log('🤖 Agent Infrastructure - Basic Agent Example\n');

  // Create tool registry
  const tools = new ToolRegistry();
  tools.register('calculator', {
    description: 'Perform calculations',
    execute: async (expr) => ({ result: eval(expr) }),
  });

  // Create agent
  const agent = new AgentBuilder()
    .withModel('gpt-4')
    .withTemperature(0.7)
    .withTools(['calculator'])
    .withMemory(new MemoryManager({ maxSize: 100 }))
    .withMaxIterations(5)
    .build();

  // Event listeners
  agent.on('start', ({ task }) => {
    console.log(`▶️  Starting task: ${task}`);
  });

  agent.on('complete', ({ result }) => {
    console.log(`✅ Task completed:`, result);
  });

  agent.on('error', ({ error }) => {
    console.error(`❌ Error:`, error.message);
  });

  // Execute task
  console.log('Executing task...\n');
  const result = await agent.execute('Calculate 123 + 456');

  // Show agent state
  console.log('\n📊 Agent State:');
  console.log(agent.getState());
}

main().catch(console.error);
