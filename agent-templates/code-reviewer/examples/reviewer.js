/**
 * Code Reviewer Example
 */

import { CodeReviewerAgent } from './agent.js';

async function main() {
  console.log('🔍 Code Reviewer Demo\n');

  const agent = new CodeReviewerAgent();

  // Event listeners
  agent.on('review-started', ({ language, lines }) => {
    console.log(`📝 Reviewing ${language} code (${lines} lines)\n`);
  });

  agent.on('review-complete', ({ issues, score, duration }) => {
    console.log(`\n✅ Review complete: ${issues} issues found`);
    console.log(`   Score: ${score}/100`);
    console.log(`   Duration: ${duration}ms\n`);
  });

  // Sample code with issues
  const sampleCode = `
function processData(userData) {
  console.log('Processing user data');
  
  const query = "SELECT * FROM users WHERE id = " + userData.id;
  db.execute(query);
  
  if (userData.name && userData.name.length > 0 && 
      userData.name.length < 100 && userData.name !== 'admin' &&
      userData.name !== 'root' && userData.name !== 'system') {
    console.log('Valid name');
  }
  
  const magicNumber = 86400;
  const timeout = magicNumber * 1000;
  
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      document.getElementById('output').innerHTML = data.html;
    });
  
  const unusedVar = 'never used';
  
  return { success: true };
}
`;

  const result = await agent.review(sampleCode, { language: 'javascript' });

  // Display results
  console.log('📊 Code Review Results:\n');
  console.log(`Grade: ${result.grade} (${result.score}/100)`);
  console.log(`Language: ${result.language}`);
  console.log(`Duration: ${result.duration}ms\n`);

  console.log('📋 Issues Found:\n');
  
  // Group by severity
  const bySeverity = { critical: [], error: [], warning: [], info: [] };
  result.issues.forEach(issue => bySeverity[issue.severity].push(issue));

  for (const [severity, issues] of Object.entries(bySeverity)) {
    if (issues.length === 0) continue;
    
    const icon = { critical: '🚨', error: '❌', warning: '⚠️', info: 'ℹ️' }[severity];
    console.log(`${icon} ${severity.toUpperCase()} (${issues.length})`);
    
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.message}`);
      console.log(`   → ${issue.suggestion}`);
      console.log(`   \`${issue.codeFrame}\`\n`);
    });
  }

  console.log('💡 Recommendations:');
  result.summary.recommendations.forEach(rec => console.log(`   ${rec}`));

  // Metrics
  console.log('\n📊 Reviewer Metrics:');
  const metrics = agent.getMetrics();
  console.log(`   Reviews: ${metrics.reviewsCompleted}`);
  console.log(`   Issues Found: ${metrics.issuesFound}`);
  console.log(`   Critical Issues: ${metrics.criticalIssues}`);
}

main().catch(console.error);
