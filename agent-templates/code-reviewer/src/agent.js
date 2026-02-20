/**
 * Code Reviewer Agent
 * Automated code review with suggestions
 */

import { EventEmitter } from 'events';

export class CodeReviewerAgent extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'Code Reviewer';
    this.rules = options.rules || this._defaultRules();
    this.severityLevels = ['info', 'warning', 'error', 'critical'];
    this.languages = options.languages || ['javascript', 'typescript', 'python'];
    this.metrics = {
      reviewsCompleted: 0,
      issuesFound: 0,
      criticalIssues: 0,
    };
  }

  async review(code, options = {}) {
    const startTime = Date.now();
    this.emit('review-started', { language: options.language, lines: code.split('\n').length });

    const language = options.language || this._detectLanguage(code);
    const issues = [];

    // Parse code
    const ast = this._parseCode(code, language);
    
    // Run rules
    for (const rule of this.rules) {
      if (rule.languages && !rule.languages.includes(language)) continue;
      
      const violations = await this._checkRule(rule, code, ast);
      for (const violation of violations) {
        issues.push({
          rule: rule.name,
          severity: rule.severity,
          message: rule.message,
          line: violation.line,
          column: violation.column,
          suggestion: rule.suggestion,
          codeFrame: violation.codeFrame,
        });
      }
    }

    // Calculate score
    const score = this._calculateScore(issues, code.length);
    
    // Generate summary
    const summary = this._generateSummary(issues, score, language);

    // Update metrics
    this.metrics.reviewsCompleted++;
    this.metrics.issuesFound += issues.length;
    this.metrics.criticalIssues += issues.filter(i => i.severity === 'critical').length;

    const duration = Date.now() - startTime;
    this.emit('review-complete', { issues: issues.length, score, duration });

    return {
      score,
      grade: this._scoreToGrade(score),
      issues,
      summary,
      language,
      duration,
    };
  }

  _defaultRules() {
    return [
      {
        name: 'no-console',
        severity: 'warning',
        languages: ['javascript', 'typescript'],
        pattern: /console\.(log|warn|error|info)/g,
        message: 'Avoid using console statements in production code',
        suggestion: 'Use a proper logging library or remove console statements',
        check: this._checkConsole,
      },
      {
        name: 'long-function',
        severity: 'warning',
        languages: ['javascript', 'typescript', 'python'],
        message: 'Function is too long (>50 lines)',
        suggestion: 'Break down into smaller functions',
        check: this._checkFunctionLength,
      },
      {
        name: 'complex-condition',
        severity: 'info',
        languages: ['javascript', 'typescript', 'python'],
        message: 'Complex conditional expression',
        suggestion: 'Extract condition into a named variable or function',
        check: this._checkComplexCondition,
      },
      {
        name: 'magic-numbers',
        severity: 'info',
        languages: ['javascript', 'typescript', 'python'],
        message: 'Magic number used without explanation',
        suggestion: 'Define as a named constant',
        check: this._checkMagicNumbers,
      },
      {
        name: 'security-sql-injection',
        severity: 'critical',
        languages: ['javascript', 'typescript', 'python'],
        message: 'Potential SQL injection vulnerability',
        suggestion: 'Use parameterized queries',
        check: this._checkSQLInjection,
      },
      {
        name: 'security-xss',
        severity: 'critical',
        languages: ['javascript', 'typescript'],
        message: 'Potential XSS vulnerability',
        suggestion: 'Sanitize user input before rendering',
        check: this._checkXSS,
      },
      {
        name: 'unused-variable',
        severity: 'warning',
        languages: ['javascript', 'typescript'],
        message: 'Variable declared but never used',
        suggestion: 'Remove unused variable or use it',
        check: this._checkUnusedVariable,
      },
      {
        name: 'missing-error-handling',
        severity: 'error',
        languages: ['javascript', 'typescript', 'python'],
        message: 'Async operation without error handling',
        suggestion: 'Add try-catch or .catch() handler',
        check: this._checkErrorHandling,
      },
    ];
  }

  _checkConsole(rule, code) {
    const violations = [];
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (rule.pattern.test(lines[i])) {
        violations.push({
          line: i + 1,
          column: lines[i].search(rule.pattern) + 1,
          codeFrame: lines[i].trim(),
        });
      }
    }
    
    return violations;
  }

  _checkFunctionLength(rule, code) {
    const violations = [];
    const funcRegex = /function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;
    let match;
    
    while ((match = funcRegex.exec(code)) !== null) {
      const body = match[1];
      const lines = body.split('\n').length;
      
      if (lines > 50) {
        violations.push({
          line: code.substring(0, match.index).split('\n').length,
          column: 1,
          codeFrame: `Function has ${lines} lines`,
        });
      }
    }
    
    return violations;
  }

  _checkComplexCondition(rule, code) {
    const violations = [];
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const andOrCount = (line.match(/\s&&(?:\s|\()/g) || []).length + 
                         (line.match(/\s\|\|(?:\s|\()/g) || []).length;
      
      if (andOrCount >= 3) {
        violations.push({
          line: i + 1,
          column: 1,
          codeFrame: line.trim(),
        });
      }
    }
    
    return violations;
  }

  _checkMagicNumbers(rule, code) {
    const violations = [];
    const lines = code.split('\n');
    const excluded = [0, 1, -1, 2, 10, 100];
    
    for (let i = 0; i < lines.length; i++) {
      const numbers = lines[i].match(/\b\d+\b/g) || [];
      
      for (const num of numbers) {
        const n = parseInt(num);
        if (!excluded.includes(n) && n > 10) {
          violations.push({
            line: i + 1,
            column: lines[i].indexOf(num),
            codeFrame: lines[i].trim(),
          });
        }
      }
    }
    
    return violations;
  }

  _checkSQLInjection(rule, code) {
    const violations = [];
    const patterns = [
      /execute\s*\(\s*["'].*\+/,
      /query\s*\(\s*["'].*\+/,
      /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i,
    ];
    
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of patterns) {
        if (pattern.test(lines[i])) {
          violations.push({
            line: i + 1,
            column: 1,
            codeFrame: lines[i].trim(),
          });
        }
      }
    }
    
    return violations;
  }

  _checkXSS(rule, code) {
    const violations = [];
    const patterns = [
      /innerHTML\s*=/,
      /document\.write\s*\(/,
      /\$\s*\(\s*['"`].*<.*>.*['"`]\s*\)/,
    ];
    
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of patterns) {
        if (pattern.test(lines[i])) {
          violations.push({
            line: i + 1,
            column: 1,
            codeFrame: lines[i].trim(),
          });
        }
      }
    }
    
    return violations;
  }

  _checkUnusedVariable(rule, code) {
    // Simplified check
    return [];
  }

  _checkErrorHandling(rule, code) {
    const violations = [];
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (/\.then\s*\(/.test(lines[i]) && !/\.catch\s*\(/.test(code)) {
        violations.push({
          line: i + 1,
          column: 1,
          codeFrame: lines[i].trim(),
        });
      }
    }
    
    return violations;
  }

  _parseCode(code, language) {
    // Simplified AST (in production, use actual parser)
    return { type: 'Program', language };
  }

  _detectLanguage(code) {
    if (code.includes('import ') || code.includes('export ')) return 'javascript';
    if (code.includes('def ') || code.includes('import ')) return 'python';
    return 'javascript';
  }

  _calculateScore(issues, codeLength) {
    const severityWeights = { info: 1, warning: 3, error: 5, critical: 10 };
    let deductions = 0;
    
    for (const issue of issues) {
      deductions += severityWeights[issue.severity] || 1;
    }
    
    const baseScore = 100;
    const maxScore = Math.max(0, baseScore - deductions);
    
    return Math.round(maxScore * 10) / 10;
  }

  _scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  _generateSummary(issues, score, language) {
    const bySeverity = { info: 0, warning: 0, error: 0, critical: 0 };
    issues.forEach(i => bySeverity[i.severity]++);
    
    return {
      totalIssues: issues.length,
      bySeverity,
      healthScore: score,
      grade: this._scoreToGrade(score),
      recommendations: this._getRecommendations(issues),
    };
  }

  _getRecommendations(issues) {
    const recommendations = [];
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    
    if (criticalCount > 0) {
      recommendations.push('🚨 Fix critical security issues immediately');
    }
    if (issues.filter(i => i.severity === 'error').length > 0) {
      recommendations.push('⚠️ Address error-level issues before merging');
    }
    if (issues.length > 10) {
      recommendations.push('📝 Consider refactoring to reduce complexity');
    }
    
    return recommendations;
  }

  getMetrics() {
    return this.metrics;
  }
}

export default CodeReviewerAgent;
