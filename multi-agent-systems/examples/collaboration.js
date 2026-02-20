/**
 * Multi-Agent Collaboration Example
 * Demonstrates agent society and collaboration
 */

import { AgentSociety, MessageBus, CollaborationProtocol } from '../src/index.js';

async function main() {
  console.log('👥 Agent Infrastructure - Multi-Agent Example\n');

  // Create agent society
  const society = new AgentSociety();

  // Add specialized agents
  console.log('Adding agents...');
  society.addAgent('researcher', {
    role: 'researcher',
    tools: ['search', 'browse'],
  });

  society.addAgent('analyst', {
    role: 'analyst',
    tools: ['calculator', 'charts'],
  });

  society.addAgent('writer', {
    role: 'writer',
    tools: ['document', 'editor'],
  });

  console.log(`  Total agents: ${society.listAgents().length}\n`);

  // List agents
  console.log('📋 Agent Roster:');
  society.listAgents().forEach(agent => {
    console.log(`  • ${agent.name} (${agent.role}) - ${agent.state}`);
  });

  // Start collaboration
  console.log('\n🤝 Starting collaboration...\n');
  const result = await society.collaborate({
    task: 'Research and write a report on AI trends in 2026',
    protocol: 'sequential',
  });

  console.log('Collaboration Results:');
  result.results.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.from} (${r.role}): ${r.content}`);
  });

  // Message bus
  console.log('\n📬 Message Bus:');
  const bus = society.messageBus;
  bus.subscribe('research', 'analyst');
  bus.subscribe('analysis', 'writer');

  const published = bus.publish('research', { topic: 'AI Trends' });
  console.log(`  Published to ${published} subscriber(s)`);

  const history = bus.getHistory(5);
  console.log(`  Message history: ${history.length} messages`);

  // Collaboration protocol
  console.log('\n📋 Custom Protocol:');
  const protocol = new CollaborationProtocol('Research-Write')
    .addStep('researcher', 'gather-info')
    .addStep('analyst', 'analyze-data')
    .addStep('writer', 'create-content');

  console.log(`  Protocol: ${protocol.name}`);
  console.log(`  Steps: ${protocol.steps.length}`);
}

main().catch(console.error);
