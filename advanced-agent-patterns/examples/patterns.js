/**
 * Advanced Agent Patterns Example
 * Demonstrates ReAct, Plan-and-Execute, and Self-Reflection
 */

import { ReActAgent, PlanAndExecuteAgent, SelfReflectiveAgent, TreeOfThoughtsAgent } from '../src/index.js';

async function main() {
  console.log('🧠 Advanced Agent Patterns Demo\n');

  // 1. ReAct Agent
  console.log('1. ReAct Agent (Reason + Act)\n');
  
  const reactAgent = new ReActAgent({
    model: 'gpt-4',
    tools: [
      {
        name: 'search',
        execute: async (query) => `Search results for: ${query}`,
      },
      {
        name: 'calculator',
        execute: async (expr) => `Result: ${expr}`,
      },
    ],
    maxIterations: 5,
  });

  reactAgent.on('start', ({ task }) => {
    console.log(`   ▶️  Starting: ${task}`);
  });

  reactAgent.on('iteration', ({ iteration }) => {
    console.log(`   🔄 Iteration ${iteration}`);
  });

  reactAgent.on('action', ({ action }) => {
    console.log(`   🔧 Action: ${action.type}(${action.input})`);
  });

  reactAgent.on('complete', ({ answer, iterations }) => {
    console.log(`   ✅ Answer: ${answer}`);
    console.log(`   📊 Iterations: ${iterations}\n`);
  });

  await reactAgent.execute('What is 123 + 456?');

  // 2. Plan and Execute Agent
  console.log('2. Plan and Execute Agent\n');
  
  const planAgent = new PlanAndExecuteAgent({
    model: 'gpt-4',
    maxSteps: 5,
  });

  planAgent.on('planning', ({ task }) => {
    console.log(`   📋 Planning: ${task}`);
  });

  planAgent.on('plan-created', ({ plan }) => {
    console.log(`   ✓ Plan created with ${plan.steps.length} steps:`);
    plan.steps.forEach((step, i) => {
      console.log(`      ${i + 1}. ${step.description}`);
    });
  });

  planAgent.on('step-start', ({ step, total }) => {
    console.log(`   → Step ${step}/${total}`);
  });

  planAgent.on('complete', ({ results, finalResult }) => {
    console.log(`   ✅ Complete: ${finalResult.summary}\n`);
  });

  await planAgent.planAndExecute('Write a research paper on AI safety');

  // 3. Self-Reflective Agent
  console.log('3. Self-Reflective Agent\n');
  
  const reflectiveAgent = new SelfReflectiveAgent({
    model: 'gpt-4',
    reflectionRounds: 3,
    criteria: ['accuracy', 'clarity', 'completeness'],
  });

  reflectiveAgent.on('start', ({ task }) => {
    console.log(`   ▶️  Starting: ${task}`);
  });

  reflectiveAgent.on('initial-response', ({ response }) => {
    console.log(`   📝 Initial: ${response.substring(0, 50)}...`);
  });

  reflectiveAgent.on('reflection', ({ round, total }) => {
    console.log(`   🤔 Reflection ${round}/${total}`);
  });

  reflectiveAgent.on('critique', ({ round, critique }) => {
    console.log(`   📊 Score: ${critique.score.toFixed(1)}/10`);
    if (critique.suggestions.length > 0) {
      console.log(`   💡 Suggestions: ${critique.suggestions.join(', ')}`);
    }
  });

  reflectiveAgent.on('complete', ({ finalResponse, finalScore, improvements }) => {
    console.log(`   ✅ Final Score: ${finalScore.toFixed(1)}/10`);
    console.log(`   📈 Improvements: ${improvements}\n`);
  });

  await reflectiveAgent.execute('Explain quantum computing');

  // 4. Tree of Thoughts Agent
  console.log('4. Tree of Thoughts Agent\n');
  
  const totAgent = new TreeOfThoughtsAgent({
    model: 'gpt-4',
    branchFactor: 3,
    maxDepth: 2,
  });

  totAgent.on('start', ({ task }) => {
    console.log(`   ▶️  Starting: ${task}`);
  });

  totAgent.on('explore', ({ node, depth }) => {
    console.log(`   🌳 Exploring node ${node} at depth ${depth}`);
  });

  totAgent.on('complete', ({ result }) => {
    console.log(`   ✅ Result: ${result.result}`);
    console.log(`   🛤️  Path length: ${result.path.length}\n`);
  });

  await totAgent.execute('Solve this riddle: What has keys but no locks?');

  console.log('✅ All patterns demonstrated!');
}

main().catch(console.error);
