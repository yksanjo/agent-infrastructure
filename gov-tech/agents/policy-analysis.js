/**
 * Policy Analysis Agent
 * Analyzes government policy documents, generates summaries, identifies impacts
 */

import { EventEmitter } from 'events';

export interface PolicyDocument {
  id: string;
  title: string;
  type: 'bill' | 'regulation' | 'memo' | 'report' | 'ordinance';
  jurisdiction: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface PolicyAnalysis {
  documentId: string;
  summary: string;
  keyPoints: string[];
  stakeholders: StakeholderImpact[];
  fiscalImpact?: FiscalImpact;
  legalConsiderations: string[];
  recommendations: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface StakeholderImpact {
  group: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface FiscalImpact {
  amount?: number;
  timeline?: string;
  category: 'revenue' | 'expense' | 'neutral';
  description: string;
}

export class PolicyAnalysisAgent extends EventEmitter {
  constructor(private options: {
    detailLevel?: 'brief' | 'standard' | 'comprehensive';
    focusAreas?: string[];
  } = {}) {
    super();
  }

  async analyze(document: PolicyDocument): Promise<PolicyAnalysis> {
    this.emit('analysis-started', { documentId: document.id });

    const analysis: PolicyAnalysis = {
      documentId: document.id,
      summary: this.generateSummary(document),
      keyPoints: this.extractKeyPoints(document),
      stakeholders: this.analyzeStakeholders(document),
      fiscalImpact: this.analyzeFiscalImpact(document),
      legalConsiderations: this.identifyLegalConsiderations(document),
      recommendations: this.generateRecommendations(document),
      sentiment: this.analyzeSentiment(document),
    };

    this.emit('analysis-completed', analysis);
    return analysis;
  }

  private generateSummary(document: PolicyDocument): string {
    // Extract key information based on document type
    const typeLabels = {
      bill: 'Legislative Bill',
      regulation: 'Regulatory Document',
      memo: 'Internal Memorandum',
      report: 'Government Report',
      ordinance: 'City Ordinance'
    };

    return `${typeLabels[document.type] || 'Document'} "${document.title}" ` +
      `for ${document.jurisdiction}. This ${document.type} addresses key ` +
      `governance issues and requires review by relevant stakeholders.`;
  }

  private extractKeyPoints(document: PolicyDocument): string[] {
    const points: string[] = [];
    const content = document.content.toLowerCase();

    // Identify key themes
    if (content.includes('budget') || content.includes('funding')) {
      points.push('Contains budgetary or funding implications');
    }
    if (content.includes('compliance') || content.includes('required')) {
      points.push('Establishes new compliance requirements');
    }
    if (content.includes('public') || content.includes('citizen')) {
      points.push('Affects public/citizen services');
    }
    if (content.includes('environment') || content.includes('sustainable')) {
      points.push('Has environmental considerations');
    }
    if (content.includes('safety') || content.includes('security')) {
      points.push('Relates to public safety or security');
    }
    if (content.includes('economic') || content.includes('jobs')) {
      points.push('Contains economic development components');
    }

    return points.length > 0 ? points : [
      'Document addresses administrative policy changes',
      'Requires implementation planning',
      'Stakeholder review recommended'
    ];
  }

  private analyzeStakeholders(document: PolicyDocument): StakeholderImpact[] {
    const content = document.content.toLowerCase();
    const stakeholders: StakeholderImpact[] = [];

    // Analyze stakeholder impacts
    if (content.includes('business') || content.includes('corporation')) {
      stakeholders.push({
        group: 'Businesses',
        impact: this.determineImpactLevel(content, ['business', 'corporation']),
        description: 'New requirements or opportunities for private sector'
      });
    }

    if (content.includes('employee') || content.includes('worker')) {
      stakeholders.push({
        group: 'Employees/Workers',
        impact: this.determineImpactLevel(content, ['employee', 'worker', 'labor']),
        description: 'Affects workforce or employment regulations'
      });
    }

    if (content.includes('resident') || content.includes('community')) {
      stakeholders.push({
        group: 'Residents/Communities',
        impact: this.determineImpactLevel(content, ['resident', 'community', 'citizen']),
        description: 'Direct impact on local communities'
      });
    }

    if (content.includes('government') || content.includes('agency')) {
      stakeholders.push({
        group: 'Government Agencies',
        impact: 'high',
        description: 'Requires implementation by government bodies'
      });
    }

    if (content.includes('environment') || content.includes('green')) {
      stakeholders.push({
        group: 'Environmental Organizations',
        impact: this.determineImpactLevel(content, ['environment', 'green', 'climate']),
        description: 'Environmental impact assessment required'
      });
    }

    return stakeholders.length > 0 ? stakeholders : [
      { group: 'General Public', impact: 'low', description: 'General policy implications' }
    ];
  }

  private determineImpactLevel(content: string, keywords: string[]): 'high' | 'medium' | 'low' {
    const mentions = keywords.filter(k => content.includes(k)).length;
    if (mentions >= 3) return 'high';
    if (mentions >= 1) return 'medium';
    return 'low';
  }

  private analyzeFiscalImpact(document: PolicyDocument): FiscalImpact | undefined {
    const content = document.content.toLowerCase();
    
    if (content.includes('budget') || content.includes('cost') || 
        content.includes('funding') || content.includes('expense')) {
      
      return {
        category: content.includes('revenue') ? 'revenue' : 
                  content.includes('expense') ? 'expense' : 'neutral',
        description: 'Contains fiscal implications that require budget analysis. ' +
          'Detailed cost-benefit analysis recommended before implementation.'
      };
    }
    
    return undefined;
  }

  private identifyLegalConsiderations(document: PolicyDocument): string[] {
    const content = document.content.toLowerCase();
    const considerations: string[] = [];

    if (content.includes('constitution') || content.includes('constitutional')) {
      considerations.push('Constitutional review may be required');
    }
    if (content.includes('federal') || content.includes('state law')) {
      considerations.push('Must comply with federal/state law');
    }
    if (content.includes('liability') || content.includes('legal')) {
      considerations.push('Legal liability assessment recommended');
    }
    if (content.includes('due process') || content.includes('notice')) {
      considerations.push('Due process requirements must be followed');
    }
    if (content.includes('privacy') || content.includes('data')) {
      considerations.push('Privacy and data protection compliance required');
    }

    return considerations.length > 0 ? considerations : [
      'Standard legal review recommended',
      'Consult with legal counsel before implementation'
    ];
  }

  private generateRecommendations(document: PolicyDocument): string[] {
    const recommendations = [
      'Conduct thorough stakeholder engagement',
      'Develop implementation timeline with milestones',
      'Establish metrics for measuring success',
      'Create public communication plan'
    ];

    if (document.type === 'bill') {
      recommendations.push('Review by legislative counsel');
      recommendations.push('Fiscal analysis by budget office');
    }

    if (document.type === 'regulation') {
      recommendations.push('Draft implementing regulations');
      recommendations.push('Provide guidance to affected parties');
    }

    return recommendations;
  }

  private analyzeSentiment(document: PolicyDocument): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['improve', 'benefit', 'enhance', 'support', 'promote', 'increase'];
    const negativeWords = ['restrict', 'limit', 'prohibit', 'penalize', 'reduce', 'eliminate'];
    
    const content = document.content.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(w => { if (content.includes(w)) positiveCount++; });
    negativeWords.forEach(w => { if (content.includes(w)) negativeCount++; });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Batch analysis for multiple documents
  async analyzeBatch(documents: PolicyDocument[]): Promise<PolicyAnalysis[]> {
    const results: PolicyAnalysis[] = [];
    
    for (const doc of documents) {
      const analysis = await this.analyze(doc);
      results.push(analysis);
    }
    
    return results;
  }
}

export default PolicyAnalysisAgent;
