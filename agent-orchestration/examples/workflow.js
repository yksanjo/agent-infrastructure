/**
 * Workflow Example
 * Demonstrates creating and executing a workflow
 */

import { WorkflowEngine, TaskQueue } from '../src/index.js';

async function main() {
  console.log('⚙️  Agent Infrastructure - Workflow Example\n');

  // Create workflow
  const workflow = new WorkflowEngine();

  // Event listeners
  workflow.on('start', ({ context }) => {
    console.log('▶️  Workflow started');
  });

  workflow.on('task:start', ({ task }) => {
    console.log(`  → Starting: ${task}`);
  });

  workflow.on('task:complete', ({ task, result }) => {
    console.log(`  ✓ Completed: ${task}`);
  });

  workflow.on('complete', ({ results }) => {
    console.log('✅ Workflow completed\n');
    console.log('Results:', results);
  });

  // Define tasks
  workflow
    .addTask('research', async () => {
      console.log('    🔍 Researching...');
      await new Promise(r => setTimeout(r, 500));
      return { findings: ['AI trend 1', 'AI trend 2'] };
    })
    .addTask('analyze', async (researchData) => {
      console.log('    📊 Analyzing...');
      await new Promise(r => setTimeout(r, 500));
      return { analysis: 'Positive growth' };
    })
    .addTask('report', async (analysisData) => {
      console.log('    📝 Writing report...');
      await new Promise(r => setTimeout(r, 500));
      return { report: 'Final report content' };
    });

  // Set dependencies
  workflow
    .dependsOn('analyze', ['research'])
    .dependsOn('report', ['analyze']);

  // Execute
  console.log('Executing workflow...\n');
  await workflow.execute();

  // Show state
  console.log('\n📊 Workflow State:');
  console.log(workflow.getState());
}

main().catch(console.error);
