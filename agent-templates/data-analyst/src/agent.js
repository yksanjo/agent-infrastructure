/**
 * Data Analyst Agent
 * Data analysis and insights generation
 */

import { EventEmitter } from 'events';

export class DataAnalystAgent extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'Data Analyst';
    this.defaultVisualization = options.defaultVisualization || 'summary';
    this.datasets = new Map();
    this.metrics = {
      analysesCompleted: 0,
      datasetsProcessed: 0,
      insightsGenerated: 0,
    };
  }

  async analyze(data, options = {}) {
    const startTime = Date.now();
    this.emit('analysis-started', { 
      rows: Array.isArray(data) ? data.length : 'object',
      type: options.type || 'auto' 
    });

    // Load dataset
    const dataset = this._prepareDataset(data);
    
    // Run analysis pipeline
    this.emit('phase', { phase: 1, name: 'Data Profiling' });
    const profile = await this._profileData(dataset);

    this.emit('phase', { phase: 2, name: 'Statistical Analysis' });
    const statistics = await this._calculateStatistics(dataset);

    this.emit('phase', { phase: 3, name: 'Pattern Detection' });
    const patterns = await this._detectPatterns(dataset, statistics);

    this.emit('phase', { phase: 4, name: 'Insight Generation' });
    const insights = await this._generateInsights(profile, statistics, patterns);

    this.emit('phase', { phase: 5, name: 'Visualization Suggestions' });
    const visualizations = await this._suggestVisualizations(dataset, insights);

    // Update metrics
    this.metrics.analysesCompleted++;
    this.metrics.datasetsProcessed++;
    this.metrics.insightsGenerated += insights.length;

    const duration = Date.now() - startTime;
    this.emit('analysis-complete', { insights: insights.length, duration });

    return {
      profile,
      statistics,
      patterns,
      insights,
      visualizations,
      duration,
      dataset: {
        name: dataset.name,
        rows: dataset.rows,
        columns: dataset.columns,
      },
    };
  }

  _prepareDataset(data) {
    const dataset = {
      name: `dataset-${Date.now()}`,
      columns: [],
      rows: 0,
      data: [],
    };

    if (Array.isArray(data)) {
      dataset.rows = data.length;
      dataset.data = data;
      
      if (data.length > 0 && typeof data[0] === 'object') {
        dataset.columns = Object.keys(data[0]);
      }
    } else if (typeof data === 'object') {
      dataset.columns = Object.keys(data);
      dataset.rows = Object.values(data)[0]?.length || 0;
      dataset.data = this._objectToArray(data);
    }

    return dataset;
  }

  _objectToArray(obj) {
    const keys = Object.keys(obj);
    const length = obj[keys[0]]?.length || 0;
    const result = [];
    
    for (let i = 0; i < length; i++) {
      const row = {};
      for (const key of keys) {
        row[key] = obj[key][i];
      }
      result.push(row);
    }
    
    return result;
  }

  async _profileData(dataset) {
    const profile = {
      totalRows: dataset.rows,
      totalColumns: dataset.columns.length,
      columns: [],
      missingValues: 0,
      duplicateRows: 0,
    };

    for (const col of dataset.columns) {
      const values = dataset.data.map(r => r[col]);
      const nonNull = values.filter(v => v !== null && v !== undefined);
      const unique = new Set(nonNull).size;
      
      const colProfile = {
        name: col,
        type: this._inferType(values),
        nonNullCount: nonNull.length,
        nullCount: values.length - nonNull.length,
        uniqueCount: unique,
        uniqueness: unique / (values.length || 1),
      };
      
      profile.columns.push(colProfile);
      profile.missingValues += colProfile.nullCount;
    }

    return profile;
  }

  _inferType(values) {
    const nonNull = values.filter(v => v !== null && v !== undefined);
    if (nonNull.length === 0) return 'unknown';
    
    const sample = nonNull[0];
    if (typeof sample === 'number') return 'numeric';
    if (typeof sample === 'boolean') return 'boolean';
    if (sample instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(sample)) return 'datetime';
    return 'categorical';
  }

  async _calculateStatistics(dataset) {
    const stats = { numeric: {}, categorical: {} };

    for (const col of dataset.columns) {
      const values = dataset.data.map(r => r[col]).filter(v => v !== null);
      const type = this._inferType(values);

      if (type === 'numeric') {
        const numbers = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
        if (numbers.length > 0) {
          numbers.sort((a, b) => a - b);
          
          stats.numeric[col] = {
            count: numbers.length,
            mean: numbers.reduce((a, b) => a + b, 0) / numbers.length,
            min: numbers[0],
            max: numbers[numbers.length - 1],
            median: numbers[Math.floor(numbers.length / 2)],
            q1: numbers[Math.floor(numbers.length * 0.25)],
            q3: numbers[Math.floor(numbers.length * 0.75)],
            stdDev: this._stdDev(numbers),
          };
        }
      } else if (type === 'categorical') {
        const counts = {};
        values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        
        stats.categorical[col] = {
          count: values.length,
          unique: Object.keys(counts).length,
          topValues: sorted.slice(0, 5).map(([val, count]) => ({ value: val, count })),
        };
      }
    }

    return stats;
  }

  _stdDev(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / numbers.length);
  }

  async _detectPatterns(dataset, statistics) {
    const patterns = [];

    // Check for correlations
    const numericCols = Object.keys(statistics.numeric);
    if (numericCols.length >= 2) {
      patterns.push({
        type: 'correlation',
        description: `Found ${numericCols.length} numeric columns for correlation analysis`,
        columns: numericCols,
      });
    }

    // Check for outliers
    for (const [col, stats] of Object.entries(statistics.numeric)) {
      const lowerBound = stats.q1 - 1.5 * stats.stdDev;
      const upperBound = stats.q3 + 1.5 * stats.stdDev;
      
      const outliers = dataset.data.filter(r => {
        const val = parseFloat(r[col]);
        return val < lowerBound || val > upperBound;
      }).length;
      
      if (outliers > 0) {
        patterns.push({
          type: 'outliers',
          column: col,
          count: outliers,
          percentage: (outliers / dataset.rows * 100).toFixed(2),
        });
      }
    }

    // Check for imbalanced categories
    for (const [col, stats] of Object.entries(statistics.categorical)) {
      if (stats.unique < 10 && stats.count > 100) {
        const topRatio = stats.topValues[0]?.count / stats.count;
        if (topRatio > 0.5) {
          patterns.push({
            type: 'imbalanced',
            column: col,
            topValue: stats.topValues[0]?.value,
            percentage: (topRatio * 100).toFixed(2),
          });
        }
      }
    }

    return patterns;
  }

  async _generateInsights(profile, statistics, patterns) {
    const insights = [];

    // Data quality insights
    const missingPct = (profile.missingValues / (profile.totalRows * profile.totalColumns) * 100).toFixed(2);
    if (missingPct > 5) {
      insights.push({
        type: 'data-quality',
        severity: 'warning',
        title: 'Missing Values Detected',
        description: `${missingPct}% of values are missing. Consider imputation or removal.`,
      });
    }

    // Statistical insights
    for (const [col, stats] of Object.entries(statistics.numeric)) {
      const cv = (stats.stdDev / stats.mean * 100).toFixed(2);
      if (cv > 50) {
        insights.push({
          type: 'variability',
          severity: 'info',
          title: `High Variability in ${col}`,
          description: `Coefficient of variation is ${cv}%. Data is widely spread.`,
        });
      }
    }

    // Pattern-based insights
    for (const pattern of patterns) {
      if (pattern.type === 'outliers') {
        insights.push({
          type: 'outliers',
          severity: 'warning',
          title: `Outliers in ${pattern.column}`,
          description: `${pattern.count} outliers (${pattern.percentage}%) detected.`,
        });
      }
      if (pattern.type === 'imbalanced') {
        insights.push({
          type: 'imbalance',
          severity: 'warning',
          title: `Imbalanced ${pattern.column}`,
          description: `Top value "${pattern.topValue}" represents ${pattern.percentage}% of data.`,
        });
      }
    }

    return insights;
  }

  async _suggestVisualizations(dataset, insights) {
    const suggestions = [];

    // Based on data types
    const numNumeric = Object.keys(dataset.data[0] || {}).filter(col => 
      this._inferType(dataset.data.map(r => r[col])) === 'numeric'
    ).length;

    if (numNumeric >= 2) {
      suggestions.push({ type: 'scatter', description: 'Scatter plot for numeric relationships' });
    }
    if (numNumeric >= 1) {
      suggestions.push({ type: 'histogram', description: 'Histogram for distribution analysis' });
      suggestions.push({ type: 'box', description: 'Box plot for outlier detection' });
    }

    // Based on insights
    const hasOutliers = insights.some(i => i.type === 'outliers');
    if (hasOutliers) {
      suggestions.push({ type: 'box', description: 'Box plot to visualize outliers' });
    }

    return suggestions;
  }

  getMetrics() {
    return this.metrics;
  }
}

export default DataAnalystAgent;
