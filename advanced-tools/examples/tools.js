/**
 * Advanced Tools Example
 * Demonstrates web scraping, code execution, database, and API tools
 */

import { WebScraper, CodeInterpreter, DatabaseConnector, APIClient, FileProcessor } from '../src/index.js';

async function main() {
  console.log('🔧 Advanced Tools Demo\n');

  // 1. Web Scraper
  console.log('1. Web Scraper\n');
  
  const scraper = new WebScraper({
    timeout: 10000,
    userAgent: 'Agent-Bot/1.0',
  });

  scraper.on('start', ({ url }) => {
    console.log(`   🌐 Scraping: ${url}`);
  });

  scraper.on('complete', ({ url, content }) => {
    console.log(`   ✓ Title: ${content.title}`);
    console.log(`   📄 Content length: ${content.content.length} chars`);
    console.log(`   🔗 Links found: ${content.links.length}\n`);
  });

  try {
    await scraper.scrape('https://example.com', { maxLength: 1000 });
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // 2. Code Interpreter
  console.log('2. Code Interpreter\n');
  
  const interpreter = new CodeInterpreter({
    sandbox: true,
    timeout: 5000,
    allowedLanguages: ['javascript'],
  });

  interpreter.on('start', ({ language, code }) => {
    console.log(`   📝 Executing ${language}:`);
    console.log(`   ${code.substring(0, 50)}...`);
  });

  interpreter.on('complete', ({ language, executionTime }) => {
    console.log(`   ✓ Completed in ${executionTime}ms\n`);
  });

  const codeResult = await interpreter.execute('javascript', `
    console.log('Hello from JS!');
    const sum = [1, 2, 3, 4, 5].reduce((a, b) => a + b, 0);
    console.log('Sum:', sum);
    sum;
  `);

  console.log(`   Output: ${codeResult.output}`);
  console.log(`   Success: ${codeResult.success}\n`);

  // 3. Database Connector
  console.log('3. Database Connector\n');
  
  const db = new DatabaseConnector('sqlite', './test.db');

  db.on('connecting', ({ type }) => {
    console.log(`   🔌 Connecting to ${type}...`);
  });

  db.on('connected', ({ type }) => {
    console.log(`   ✓ Connected to ${type}\n`);
  });

  db.on('query', ({ sql, params }) => {
    console.log(`   📊 Query: ${sql}`);
  });

  try {
    await db.connect();
    const results = await db.query('SELECT * FROM users LIMIT 5');
    console.log(`   Results: ${results.length} rows\n`);
  } catch (error) {
    console.log(`   Note: ${error.message}\n`);
  }

  // 4. API Client
  console.log('4. API Client\n');
  
  const api = new APIClient('https://jsonplaceholder.typicode.com', {
    timeout: 10000,
    retry: { attempts: 3, delay: 500 },
  });

  api.on('request', ({ method, url }) => {
    console.log(`   📡 ${method} ${url}`);
  });

  api.on('success', ({ status }) => {
    console.log(`   ✓ Status: ${status}\n`);
  });

  try {
    // GET request
    const getResponse = await api.get('/posts/1');
    console.log(`   GET /posts/1:`);
    console.log(`   Title: ${getResponse.data.title.substring(0, 50)}...\n`);

    // POST request
    const postResponse = await api.post('/posts', {
      title: 'New Post',
      body: 'This is the body',
      userId: 1,
    });
    console.log(`   POST /posts:`);
    console.log(`   Created ID: ${postResponse.data.id}\n`);

  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // 5. File Processor
  console.log('5. File Processor\n');
  
  const fileProcessor = new FileProcessor({
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  fileProcessor.on('read', ({ filePath }) => {
    console.log(`   📖 Reading: ${filePath}`);
  });

  fileProcessor.on('write', ({ filePath }) => {
    console.log(`   ✍️  Writing: ${filePath}`);
  });

  // Write a JSON file
  const testData = [
    { id: 1, name: 'Alice', role: 'Developer' },
    { id: 2, name: 'Bob', role: 'Designer' },
    { id: 3, name: 'Charlie', role: 'Manager' },
  ];

  try {
    await fileProcessor.write('/tmp/test-data.json', testData);
    console.log(`   ✓ Wrote test-data.json\n`);

    const readData = await fileProcessor.read('/tmp/test-data.json');
    console.log(`   ✓ Read ${readData.content.length} records\n`);

    // CSV export
    await fileProcessor.write('/tmp/test-data.csv', testData);
    console.log(`   ✓ Wrote test-data.csv\n`);

  } catch (error) {
    console.log(`   Note: ${error.message}\n`);
  }

  console.log('✅ All tools demonstrated!');
}

main().catch(console.error);
