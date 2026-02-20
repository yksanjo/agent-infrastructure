/**
 * Deployment Example
 * Demonstrates model deployment and serving
 */

import { ModelServer, DeploymentManager, LoadBalancer } from '../src/index.js';

async function main() {
  console.log('🚀 Agent Infrastructure - Deployment Example\n');

  // Create deployment manager
  const manager = new DeploymentManager();

  // Deploy models
  console.log('Deploying models...\n');

  await manager.create('llama-7b', {
    model: 'meta-llama/Llama-2-7b',
    provider: 'vllm',
    gpuCount: 1,
    port: 8001,
  });

  await manager.create('llama-13b', {
    model: 'meta-llama/Llama-2-13b',
    provider: 'vllm',
    gpuCount: 2,
    port: 8002,
  });

  // Start servers
  const server1 = await manager.get('llama-7b');
  await server1.start();

  const server2 = await manager.get('llama-13b');
  await server2.start();

  // List deployments
  console.log('📊 Active Deployments:');
  const deployments = await manager.list();
  deployments.forEach(dep => {
    console.log(`  • ${dep.name}: ${dep.status} @ ${dep.endpoint}`);
  });

  // Health check
  console.log('\n🏥 Health Check:');
  const health = await server1.health();
  console.log(`  Status: ${health.status}`);
  console.log(`  Endpoint: ${health.endpoint}`);
  console.log(`  Model: ${health.model}`);

  // Load balancer
  console.log('\n⚖️  Load Balancer:');
  const lb = new LoadBalancer();
  lb.addInstance({ endpoint: 'http://localhost:8001' });
  lb.addInstance({ endpoint: 'http://localhost:8002' });
  lb.addInstance({ endpoint: 'http://localhost:8003' });

  const stats = lb.getStats();
  console.log(`  Total instances: ${stats.total}`);
  console.log(`  Healthy: ${stats.healthy}`);

  // Get next instance
  const next = lb.getNext();
  console.log(`  Next request → ${next.endpoint}`);

  // Cleanup
  console.log('\n🛑 Stopping servers...');
  await server1.stop();
  await server2.stop();
  console.log('  Servers stopped');
}

main().catch(console.error);
