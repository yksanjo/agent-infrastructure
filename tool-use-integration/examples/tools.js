/**
 * Tool Integration Example
 * Demonstrates tool registry and MCP client
 */

import { ToolRegistry, MCPClient, WorkflowConnector, BuiltinTools } from '../src/index.js';

async function main() {
  console.log('🔧 Agent Infrastructure - Tool Integration Example\n');

  // Create tool registry
  const registry = new ToolRegistry();

  // Register built-in tools
  console.log('Registering tools...');
  registry.register('search', BuiltinTools.search);
  registry.register('calculator', BuiltinTools.calculator);
  registry.register('fileSystem', BuiltinTools.fileSystem);
  registry.register('httpClient', BuiltinTools.httpClient);

  console.log(`  Total tools: ${registry.list().length}\n`);

  // List available tools
  console.log('📋 Available Tools:');
  registry.list().forEach(tool => {
    console.log(`  • ${tool.name}: ${tool.description}`);
  });

  // Execute tools
  console.log('\n🚀 Executing tools...\n');

  // Calculator
  console.log('1. Calculator:');
  const calcResult = await registry.execute('calculator', { expression: '123 + 456' });
  console.log(`   Result: ${calcResult.result}\n`);

  // Search
  console.log('2. Web Search:');
  const searchResult = await registry.execute('search', { query: 'AI trends 2026', limit: 5 });
  console.log(`   Found: ${searchResult.results.length} results\n`);

  // HTTP Client
  console.log('3. HTTP Request:');
  const httpResult = await registry.execute('httpClient', {
    url: 'https://api.example.com/data',
    method: 'GET',
  });
  console.log(`   Status: ${httpResult.status}\n`);

  // MCP Client
  console.log('🔌 MCP Client:');
  const mcp = new MCPClient({ serverUrl: 'http://localhost:3000' });

  await mcp.connect();
  console.log(`  Connected: ${mcp.connected}`);

  mcp.registerResource('resource://docs/readme', '# Agent Infrastructure');
  const resources = await mcp.listResources();
  console.log(`  Resources: ${resources.length}`);

  const toolResult = await mcp.callTool('search', { query: 'test' });
  console.log(`  Tool call: ${toolResult.result}\n`);

  await mcp.disconnect();
  console.log(`  Disconnected: ${!mcp.connected}`);

  // Workflow Connector
  console.log('\n⚙️  Workflow Connector:');
  const connector = new WorkflowConnector('zapier', { apiKey: 'test-key' });

  const workflows = await connector.listWorkflows();
  console.log('  Available workflows:');
  workflows.forEach(wf => {
    console.log(`    • ${wf.name} (${wf.status})`);
  });

  const triggered = await connector.trigger('wf-1', { data: 'test' });
  console.log(`\n  Triggered: ${triggered.triggered}`);
  console.log(`  Execution ID: ${triggered.executionId}`);
}

main().catch(console.error);
