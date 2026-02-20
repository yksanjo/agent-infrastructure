/**
 * Customer Support Agent Example
 */

import { CustomerSupportAgent } from './agent.js';

async function main() {
  console.log('🎧 Customer Support Agent Demo\n');

  // Create agent
  const agent = new CustomerSupportAgent({
    escalationThreshold: 3,
  });

  // Add knowledge base
  agent.addKnowledgeArticle({
    title: 'Refund Policy',
    content: 'We offer full refunds within 30 days of purchase. Contact billing@example.com for refund requests.',
    category: 'billing',
  });

  agent.addKnowledgeArticle({
    title: 'Password Reset',
    content: 'To reset your password, go to the login page and click "Forgot Password". You will receive an email with reset instructions.',
    category: 'account',
  });

  agent.addKnowledgeArticle({
    title: 'Subscription Plans',
    content: 'We offer Basic ($9/mo), Pro ($29/mo), and Enterprise ($99/mo) plans. You can upgrade or downgrade anytime.',
    category: 'billing',
  });

  // Event listeners
  agent.on('message-received', ({ userId, message }) => {
    console.log(`📥 User ${userId}: ${message}`);
  });

  agent.on('response-sent', ({ userId, response, responseTime }) => {
    console.log(`📤 Agent: ${response.text.substring(0, 100)}...`);
    console.log(`   Confidence: ${(response.confidence * 100).toFixed(0)}%`);
    console.log(`   Response time: ${responseTime}ms\n`);
  });

  agent.on('escalation-needed', ({ userId, reason }) => {
    console.log(`⚠️  Escalation needed for ${userId}: ${reason}\n`);
  });

  // Simulate conversations
  const conversations = [
    { userId: 'user-1', message: 'How do I reset my password?' },
    { userId: 'user-2', message: 'What is your refund policy?' },
    { userId: 'user-1', message: 'Thanks! That was helpful.' },
    { userId: 'user-3', message: 'I want to cancel my subscription' },
    { userId: 'user-4', message: 'Your service is terrible! I want a refund NOW!' },
  ];

  for (const conv of conversations) {
    const response = await agent.respond(conv.userId, conv.message);
    
    if (response.suggestedActions?.length > 0) {
      console.log(`   💡 Suggested actions: ${response.suggestedActions.map(a => a.label).join(', ')}\n`);
    }
  }

  // Show metrics
  console.log('📊 Support Metrics:');
  const metrics = agent.getMetrics();
  console.log(`   Conversations: ${metrics.conversationsHandled}`);
  console.log(`   Resolved: ${metrics.resolvedCount}`);
  console.log(`   Escalated: ${metrics.escalatedCount}`);
  console.log(`   Resolution Rate: ${metrics.resolutionRate}%`);
  console.log(`   Avg Response Time: ${metrics.avgResponseTime.toFixed(0)}ms`);
}

main().catch(console.error);
