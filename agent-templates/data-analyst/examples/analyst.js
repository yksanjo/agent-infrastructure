/**
 * Data Analyst Example
 */

import { DataAnalystAgent } from './agent.js';

async function main() {
  console.log('📊 Data Analyst Demo\n');

  const agent = new DataAnalystAgent();

  // Event listeners
  agent.on('analysis-started', ({ rows, type }) => {
    console.log(`📈 Analyzing dataset (${rows} rows)\n`);
  });

  agent.on('phase', ({ phase, name }) => {
    console.log(`📊 Phase ${phase}: ${name}`);
  });

  agent.on('analysis-complete', ({ insights, duration }) => {
    console.log(`\n✅ Analysis complete: ${insights} insights`);
    console.log(`   Duration: ${duration}ms\n`);
  });

  // Sample sales data
  const salesData = [
    { date: '2024-01-01', region: 'North', product: 'A', sales: 1500, units: 15 },
    { date: '2024-01-02', region: 'South', product: 'B', sales: 2300, units: 23 },
    { date: '2024-01-03', region: 'North', product: 'A', sales: 1800, units: 18 },
    { date: '2024-01-04', region: 'East', product: 'C', sales: 900, units: 9 },
    { date: '2024-01-05', region: 'West', product: 'B', sales: 2100, units: 21 },
    { date: '2024-01-06', region: 'North', product: 'A', sales: 1600, units: 16 },
    { date: '2024-01-07', region: 'South', product: 'C', sales: 850, units: 8 },
    { date: '2024-01-08', region: 'East', product: 'B', sales: 2500, units: 25 },
    { date: '2024-01-09', region: 'West', product: 'A', sales: 1700, units: 17 },
    { date: '2024-01-10', region: 'North', product: 'C', sales: 950, units: 9 },
    // Add outlier
    { date: '2024-01-11', region: 'South', product: 'A', sales: 15000, units: 150 },
  ];

  const result = await agent.analyze(salesData);

  // Display results
  console.log('📊 Dataset Profile:\n');
  console.log(`Rows: ${result.profile.totalRows}`);
  console.log(`Columns: ${result.profile.totalColumns}`);
  console.log(`Missing Values: ${result.profile.missingValues}\n`);

  console.log('📈 Column Types:');
  result.profile.columns.forEach(col => {
    console.log(`   ${col.name}: ${col.type} (${col.nonNullCount} non-null)`);
  });

  console.log('\n📊 Numeric Statistics:');
  for (const [col, stats] of Object.entries(result.statistics.numeric)) {
    console.log(`\n   ${col}:`);
    console.log(`      Mean: ${stats.mean.toFixed(2)}`);
    console.log(`      Median: ${stats.median}`);
    console.log(`      Std Dev: ${stats.stdDev.toFixed(2)}`);
    console.log(`      Range: ${stats.min} - ${stats.max}`);
  }

  console.log('\n🔍 Patterns Detected:');
  result.patterns.forEach(pattern => {
    console.log(`   • ${pattern.type}: ${pattern.description}`);
  });

  console.log('\n💡 Insights:');
  result.insights.forEach((insight, i) => {
    const icon = { warning: '⚠️', info: 'ℹ️', error: '❌' }[insight.severity] || '•';
    console.log(`   ${icon} ${insight.title}`);
    console.log(`      ${insight.description}\n`);
  });

  console.log('📊 Visualization Suggestions:');
  result.visualizations.forEach(viz => {
    console.log(`   • ${viz.type}: ${viz.description}`);
  });

  // Metrics
  console.log('\n📊 Analyst Metrics:');
  const metrics = agent.getMetrics();
  console.log(`   Analyses: ${metrics.analysesCompleted}`);
  console.log(`   Datasets: ${metrics.datasetsProcessed}`);
  console.log(`   Insights: ${metrics.insightsGenerated}`);
}

main().catch(console.error);
