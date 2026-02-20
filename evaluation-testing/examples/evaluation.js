/**
 * Evaluation Example
 * Demonstrates testing and evaluation of LLM responses
 */

import { TestSuite, Metrics, Evaluator } from '../src/index.js';

async function main() {
  console.log('🧪 Agent Infrastructure - Evaluation Example\n');

  // Create test suite
  const suite = new TestSuite('Q&A Evaluation');

  // Add test cases
  suite.addCase({
    name: 'TypeScript Definition',
    input: 'What is TypeScript?',
    expected: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript',
  });

  suite.addCase({
    name: 'Node.js Purpose',
    input: 'What is Node.js used for?',
    expected: 'Node.js is used for server-side JavaScript development',
  });

  suite.addCase({
    name: 'React Framework',
    input: 'What is React?',
    expected: 'React is a JavaScript library for building user interfaces',
  });

  // Run evaluation
  console.log('Running evaluation...\n');
  const summary = await suite.run({
    metrics: [Metrics.ACCURACY, Metrics.RELEVANCE],
    threshold: 0.6,
  });

  // Display results
  console.log('📊 Evaluation Results:');
  console.log(`  Suite: ${summary.name}`);
  console.log(`  Total: ${summary.total}`);
  console.log(`  Passed: ${summary.passed}`);
  console.log(`  Failed: ${summary.failed}`);
  console.log(`  Pass Rate: ${summary.passRate.toFixed(1)}%\n`);

  console.log('Detailed Results:');
  summary.results.forEach((result, i) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`  ${icon} ${result.testCase}: ${(result.score * 100).toFixed(0)}%`);
  });

  // Standalone evaluator
  console.log('\n\n🔍 Standalone Evaluation:');
  const evaluator = new Evaluator({ metrics: [Metrics.ACCURACY] });
  const result = await evaluator.evaluate(
    'TypeScript adds types to JavaScript',
    'TypeScript is a typed superset of JavaScript'
  );
  console.log(`  Accuracy: ${(result.average * 100).toFixed(0)}%`);
}

main().catch(console.error);
