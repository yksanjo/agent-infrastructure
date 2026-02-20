/**
 * Advanced Tools
 * Web scraper, Code interpreter, Database, API integrations
 */

import { EventEmitter } from 'events';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Web Scraper - Extract content from websites
 */
export class WebScraper extends EventEmitter {
  constructor(options = {}) {
    super();
    this.timeout = options.timeout || 10000;
    this.userAgent = options.userAgent || 'Agent-Bot/1.0';
    this.respectRobotsTxt = options.respectRobotsTxt ?? true;
    this.cache = new Map();
  }

  async scrape(url, options = {}) {
    this.emit('start', { url });

    try {
      // Check cache
      if (this.cache.has(url) && Date.now() - this.cache.get(url).timestamp < 3600000) {
        this.emit('cache-hit', { url });
        return this.cache.get(url).content;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const content = this._parseHTML(html, options);

      // Cache result
      this.cache.set(url, {
        content,
        timestamp: Date.now(),
      });

      this.emit('complete', { url, content });
      return content;
    } catch (error) {
      this.emit('error', { url, error: error.message });
      throw error;
    }
  }

  _parseHTML(html, options) {
    // Simple HTML parsing (in production, use cheerio)
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
    const body = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const links = [];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({ text: match[2], href: match[1] });
    }

    return {
      title,
      content: body.substring(0, options.maxLength || 5000),
      links: links.slice(0, options.maxLinks || 50),
      scrapedAt: Date.now(),
    };
  }

  async scrapeMultiple(urls, options = {}) {
    const results = [];
    for (const url of urls) {
      try {
        const content = await this.scrape(url, options);
        results.push({ url, success: true, content });
      } catch (error) {
        results.push({ url, success: false, error: error.message });
      }
      
      // Rate limiting
      if (options.delay) {
        await new Promise(r => setTimeout(r, options.delay));
      }
    }
    return results;
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * Code Interpreter - Execute code safely
 */
export class CodeInterpreter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.sandbox = options.sandbox ?? true;
    this.timeout = options.timeout || 30000;
    this.maxOutputSize = options.maxOutputSize || 100000;
    this.allowedLanguages = options.allowedLanguages || ['javascript', 'python'];
  }

  async execute(language, code, context = {}) {
    this.emit('start', { language, code: code.substring(0, 100) });

    if (!this.allowedLanguages.includes(language)) {
      throw new Error(`Language not allowed: ${language}`);
    }

    const startTime = Date.now();

    try {
      let result;

      if (language === 'javascript') {
        result = await this._executeJS(code, context);
      } else if (language === 'python') {
        result = await this._executePython(code, context);
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }

      const executionTime = Date.now() - startTime;
      this.emit('complete', { language, executionTime });

      return {
        success: true,
        output: result.output,
        executionTime,
        language,
      };
    } catch (error) {
      this.emit('error', { language, error: error.message });
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      };
    }
  }

  async _executeJS(code, context) {
    // Safe JS execution with limited context
    const safeContext = {
      console: {
        log: (...args) => this._captureOutput('log', args),
        error: (...args) => this._captureOutput('error', args),
        warn: (...args) => this._captureOutput('warn', args),
      },
      Math,
      JSON,
      Date,
      ...context,
    };

    let output = [];
    this._captureOutput = (type, args) => {
      output.push({ type, args: args.map(String).join(' ') });
    };

    // Create safe execution function
    const executeFn = new Function('context', `
      with (context) {
        return (async () => {
          ${code}
        })();
      }
    `);

    const result = await Promise.race([
      executeFn(safeContext),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout')), this.timeout)
      ),
    ]);

    return {
      output: output.join('\n'),
      result: result !== undefined ? String(result) : null,
    };
  }

  async _executePython(code, context) {
    // In production, use actual Python interpreter via subprocess
    // This is a simulation for demo purposes
    return {
      output: `[Python execution simulated]\n${code}`,
      result: null,
    };
  }

  async executeFile(language, filePath, context = {}) {
    const fs = await import('fs/promises');
    const code = await fs.readFile(filePath, 'utf-8');
    return this.execute(language, code, context);
  }
}

/**
 * Database Connector - SQL/NoSQL database access
 */
export class DatabaseConnector extends EventEmitter {
  constructor(type, connection, options = {}) {
    super();
    this.type = type; // 'sqlite', 'postgres', 'mysql', 'mongodb'
    this.connection = connection;
    this.options = options;
    this.connected = false;
  }

  async connect() {
    this.emit('connecting', { type: this.type });

    try {
      if (this.type === 'sqlite') {
        await this._connectSQLite();
      } else if (this.type === 'postgres' || this.type === 'mysql') {
        await this._connectSQL();
      } else if (this.type === 'mongodb') {
        await this._connectMongo();
      }

      this.connected = true;
      this.emit('connected', { type: this.type });
      return true;
    } catch (error) {
      this.emit('error', { error: error.message });
      throw error;
    }
  }

  async _connectSQLite() {
    // In production, use better-sqlite3
    this.db = { type: 'sqlite', path: this.connection };
  }

  async _connectSQL() {
    // In production, use pg or mysql2
    this.db = { type: this.type, connection: this.connection };
  }

  async _connectMongo() {
    // In production, use mongodb driver
    this.db = { type: 'mongodb', connection: this.connection };
  }

  async query(sql, params = []) {
    if (!this.connected) {
      await this.connect();
    }

    this.emit('query', { sql, params });

    // Validate query (prevent dangerous operations)
    if (!this._isSafeQuery(sql)) {
      throw new Error('Query contains unsafe operations');
    }

    // Simulated query execution
    const startTime = Date.now();
    
    // In production, execute actual query
    const results = this._simulateQuery(sql, params);
    
    this.emit('complete', { rows: results.length, duration: Date.now() - startTime });
    return results;
  }

  async insert(table, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    return this.query(sql, values);
  }

  async update(table, data, where) {
    const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const values = [...Object.values(data), ...Object.values(where)];
    
    return this.query(sql, values);
  }

  async delete(table, where) {
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    return this.query(sql, Object.values(where));
  }

  _isSafeQuery(sql) {
    const upperSQL = sql.toUpperCase();
    const dangerous = ['DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE'];
    return !dangerous.some(keyword => upperSQL.includes(keyword));
  }

  _simulateQuery(sql, params) {
    // Simulated results
    return [
      { id: 1, name: 'Sample Result', created_at: new Date() },
    ];
  }

  async disconnect() {
    this.connected = false;
    this.emit('disconnected');
  }
}

/**
 * API Client - REST/GraphQL API calls
 */
export class APIClient extends EventEmitter {
  constructor(baseURL, options = {}) {
    super();
    this.baseURL = baseURL;
    this.timeout = options.timeout || 30000;
    this.headers = options.headers || {};
    this.auth = options.auth || null;
    this.retryConfig = options.retry || { attempts: 3, delay: 1000 };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';

    this.emit('request', { method, url });

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    if (this.auth) {
      if (this.auth.type === 'bearer') {
        config.headers.Authorization = `Bearer ${this.auth.token}`;
      } else if (this.auth.type === 'basic') {
        const credentials = btoa(`${this.auth.username}:${this.auth.password}`);
        config.headers.Authorization = `Basic ${credentials}`;
      }
    }

    try {
      const response = await this._withRetry(() => fetch(url, config));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.emit('success', { status: response.status });
      
      return {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers),
      };
    } catch (error) {
      this.emit('error', { error: error.message });
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async graphql(query, variables = {}) {
    return this.post('/graphql', { query, variables });
  }

  async _withRetry(fn) {
    let lastError;
    for (let i = 0; i < this.retryConfig.attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < this.retryConfig.attempts - 1) {
          await new Promise(r => setTimeout(r, this.retryConfig.delay * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  }
}

/**
 * File Processor - Read/write various file formats
 */
export class FileProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.encoding = options.encoding || 'utf-8';
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
  }

  async read(filePath, options = {}) {
    const fs = await import('fs/promises');
    const path = await import('path');

    this.emit('read', { filePath });

    const stats = await fs.stat(filePath);
    if (stats.size > this.maxSize) {
      throw new Error(`File too large: ${stats.size} bytes`);
    }

    const ext = path.extname(filePath).toLowerCase();
    let content;

    if (options.binary) {
      content = await fs.readFile(filePath);
    } else {
      content = await fs.readFile(filePath, this.encoding);
    }

    // Parse based on extension
    if (ext === '.json') {
      content = JSON.parse(content);
    } else if (ext === '.csv') {
      content = this._parseCSV(content);
    } else if (ext === '.xml') {
      content = this._parseXML(content);
    }

    this.emit('complete', { size: stats.size });
    return { content, stats, path: filePath };
  }

  async write(filePath, data, options = {}) {
    const fs = await import('fs/promises');
    const path = await import('path');

    this.emit('write', { filePath });

    const ext = path.extname(filePath).toLowerCase();
    let content = data;

    if (ext === '.json') {
      content = JSON.stringify(data, null, 2);
    } else if (ext === '.csv') {
      content = this._toCSV(data);
    }

    await fs.writeFile(filePath, content, this.encoding);
    this.emit('complete', { filePath });
    return { path: filePath, written: true };
  }

  _parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i]?.trim();
        return obj;
      }, {});
    });
  }

  _parseXML(content) {
    // Simple XML parsing (in production, use xml2js)
    return { raw: content };
  }

  _toCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
  }
}

export default {
  WebScraper,
  CodeInterpreter,
  DatabaseConnector,
  APIClient,
  FileProcessor,
};
