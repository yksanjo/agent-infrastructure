# Advanced Tools

[![npm version](https://img.shields.io/npm/v/advanced-tools.svg)](https://www.npmjs.com/package/advanced-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Advanced tools for AI agents - Web scraper, Code interpreter, Database, API integrations

## 📦 Included Tools

| Tool | Description | Category |
|------|-------------|----------|
| **WebScraper** | Extract content from websites | Information |
| **CodeInterpreter** | Execute code safely | Execution |
| **DatabaseConnector** | SQL/NoSQL database access | Data |
| **APIClient** | REST/GraphQL API calls | Network |
| **FileProcessor** | Read/write various file formats | I/O |
| **Scheduler** | Cron-like task scheduling | Utility |

## 🚀 Quick Start

```javascript
import { WebScraper, CodeInterpreter, DatabaseConnector } from '@agent-infra/tools';

// Web Scraping
const scraper = new WebScraper();
const content = await scraper.scrape('https://example.com', {
  selector: 'article',
  extract: ['title', 'content', 'links'],
});

// Code Execution
const interpreter = new CodeInterpreter({ sandbox: true });
const result = await interpreter.execute('python', 'print(2 + 2)');

// Database
const db = new DatabaseConnector('sqlite', './data.db');
const rows = await db.query('SELECT * FROM users WHERE active = ?', [true]);
```

## 🔒 Security

- Code execution runs in sandboxed environment
- Database queries use parameterized statements
- Web scraping respects robots.txt
- API keys stored securely

## 📝 License

MIT License
