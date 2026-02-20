/**
 * Research Assistant Example
 */

import { ResearchAssistantAgent } from './agent.js';

async function main() {
  console.log('📚 Research Assistant Demo\n');

  const agent = new ResearchAssistantAgent({
    searchDepth: 'medium',
    maxSources: 5,
  });

  // Event listeners
  agent.on('research-started', ({ topic }) => {
    console.log(`🔍 Starting research: ${topic}\n`);
  });

  agent.on('phase', ({ phase, name }) => {
    console.log(`📊 Phase ${phase}: ${name}`);
  });

  agent.on('analyzing-source', ({ source }) => {
    console.log(`   📖 Analyzing: ${source}`);
  });

  agent.on('research-complete', ({ duration }) => {
    console.log(`\n✅ Research complete in ${(duration / 1000).toFixed(1)}s\n`);
  });

  // Run research
  const result = await agent.research('Impact of AI on Software Development', {
    maxSources: 5,
    includeStats: true,
  });

  // Display report
  console.log('📄 Research Report:\n');
  console.log(result.report);

  // Display sources
  console.log('\n📚 Top Sources:');
  result.sources.slice(0, 3).forEach((source, i) => {
    console.log(`\n${i + 1}. ${source.title}`);
    console.log(`   Type: ${source.type}`);
    console.log(`   Relevance: ${(source.relevance * 100).toFixed(0)}%`);
    console.log(`   Credibility: ${(source.credibility * 100).toFixed(0)}%`);
    console.log(`   Key Points:`);
    source.keyPoints.forEach(point => console.log(`     • ${point}`));
  });

  // Metrics
  console.log('\n📊 Research Metrics:');
  const metrics = agent.getMetrics();
  console.log(`   Researches: ${metrics.researchesCompleted}`);
  console.log(`   Sources Analyzed: ${metrics.sourcesAnalyzed}`);
}

main().catch(console.error);
