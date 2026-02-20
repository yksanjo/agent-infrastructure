/**
 * Customer Support Agent
 * 24/7 automated customer support with knowledge base
 */

import { EventEmitter } from 'events';

export class CustomerSupportAgent extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'Customer Support Agent';
    this.knowledgeBase = options.knowledgeBase || [];
    this.escalationThreshold = options.escalationThreshold || 3;
    this.conversationHistory = new Map();
    this.metrics = {
      conversationsHandled: 0,
      resolvedCount: 0,
      escalatedCount: 0,
      avgResponseTime: 0,
    };
  }

  async respond(userId, message) {
    const startTime = Date.now();
    this.emit('message-received', { userId, message });

    // Get conversation context
    const history = this.conversationHistory.get(userId) || [];
    
    // Analyze sentiment
    const sentiment = this._analyzeSentiment(message);
    
    // Check for escalation triggers
    if (this._shouldEscalate(message, history)) {
      this.metrics.escalatedCount++;
      this.emit('escalation-needed', { userId, reason: 'Multiple unresolved issues' });
      return this._escalate(userId, message);
    }

    // Search knowledge base
    const answer = await this._searchKnowledgeBase(message, history);
    
    // Generate response
    const response = {
      text: answer.found ? answer.content : this._generateFallback(message),
      confidence: answer.confidence,
      sources: answer.sources,
      suggestedActions: this._getSuggestedActions(message),
    };

    // Update history
    history.push({ role: 'user', content: message, timestamp: Date.now() });
    history.push({ role: 'assistant', content: response.text, timestamp: Date.now() });
    this.conversationHistory.set(userId, history.slice(-20)); // Keep last 10 exchanges

    // Update metrics
    const responseTime = Date.now() - startTime;
    this._updateMetrics(responseTime, answer.found);

    this.emit('response-sent', { userId, response, responseTime });
    return response;
  }

  async _searchKnowledgeBase(query, history) {
    // Simple keyword matching (in production, use vector search)
    const queryWords = query.toLowerCase().split(/\s+/);
    
    let bestMatch = null;
    let bestScore = 0;

    for (const article of this.knowledgeBase) {
      const content = `${article.title} ${article.content}`.toLowerCase();
      let score = 0;
      
      for (const word of queryWords) {
        if (content.includes(word)) score += 1;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = article;
      }
    }

    const confidence = bestScore / queryWords.length;
    
    return {
      found: confidence > 0.3,
      content: bestMatch?.content || null,
      confidence,
      sources: bestMatch ? [bestMatch.title] : [],
    };
  }

  _analyzeSentiment(text) {
    const positive = ['great', 'good', 'thanks', 'awesome', 'helpful', 'love'];
    const negative = ['angry', 'frustrated', 'hate', 'terrible', 'worst', 'useless'];
    
    const lower = text.toLowerCase();
    let score = 0;
    
    positive.forEach(w => { if (lower.includes(w)) score += 1; });
    negative.forEach(w => { if (lower.includes(w)) score -= 1; });
    
    return {
      score,
      label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
    };
  }

  _shouldEscalate(message, history) {
    // Escalate if user is frustrated or has repeated issues
    const sentiment = this._analyzeSentiment(message);
    const recentIssues = history.filter(h => 
      h.role === 'user' && 
      this._analyzeSentiment(h.content).label === 'negative'
    ).length;
    
    return sentiment.label === 'negative' && recentIssues >= this.escalationThreshold;
  }

  _generateFallback(message) {
    return `I understand you're asking about "${message.substring(0, 50)}...". ` +
           `Let me connect you with a human agent who can better assist you. ` +
           `In the meantime, you can visit our help center at help.example.com`;
  }

  _getSuggestedActions(message) {
    const actions = [];
    const lower = message.toLowerCase();
    
    if (lower.includes('refund')) actions.push({ label: 'Request Refund', action: 'refund' });
    if (lower.includes('password')) actions.push({ label: 'Reset Password', action: 'reset-password' });
    if (lower.includes('billing')) actions.push({ label: 'View Billing', action: 'billing' });
    if (lower.includes('cancel')) actions.push({ label: 'Cancel Subscription', action: 'cancel' });
    
    return actions;
  }

  _updateMetrics(responseTime, resolved) {
    this.metrics.conversationsHandled++;
    if (resolved) this.metrics.resolvedCount++;
    
    // Update average response time
    const total = this.metrics.conversationsHandled;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (total - 1) + responseTime) / total;
  }

  _escalate(userId, message) {
    return {
      text: "I'm connecting you with a human agent who can better assist you.",
      escalated: true,
      ticketId: `TICKET-${Date.now()}`,
      estimatedWait: '2-5 minutes',
    };
  }

  addKnowledgeArticle(article) {
    this.knowledgeBase.push({
      id: `kb-${Date.now()}`,
      ...article,
      createdAt: Date.now(),
    });
  }

  getMetrics() {
    return {
      ...this.metrics,
      resolutionRate: this.metrics.conversationsHandled > 0 
        ? (this.metrics.resolvedCount / this.metrics.conversationsHandled * 100).toFixed(1) 
        : 0,
    };
  }
}

export default CustomerSupportAgent;
