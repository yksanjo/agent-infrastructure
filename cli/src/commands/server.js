#!/usr/bin/env node

/**
 * Dashboard Server
 * Serves the web dashboard with real-time updates
 */

import { createServer } from 'http';
import { readFileSync, existsSync, watch } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, '..', '..');

const PORT = process.env.PORT || 3456;
const LOG_FILE = join(__root, '..', 'agent-infra-loop-log.json');
const DASHBOARD_FILE = join(__root, 'dashboard.html');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/**
 * Read logs file
 */
function readLogs() {
  if (!existsSync(LOG_FILE)) {
    return [];
  }
  
  try {
    const content = readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Handle HTTP requests
 */
function handleRequest(req, res) {
  // Handle logs endpoint
  if (req.url === '/logs.json') {
    const logs = readLogs();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(logs));
    return;
  }

  // Serve dashboard HTML
  if (req.url === '/' || req.url === '/dashboard.html') {
    try {
      const content = readFileSync(DASHBOARD_FILE);
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(content);
      return;
    } catch {
      res.writeHead(404);
      res.end('Dashboard not found');
      return;
    }
  }

  // Static files (CSS, JS, etc)
  let filePath = req.url;
  const fullPath = join(__root, filePath);
  const ext = extname(fullPath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(fullPath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('File not found');
  }
}

/**
 * Start server
 */
async function startServer() {
  const spinner = ora(chalk.cyan('Starting dashboard server...')).start();
  
  const server = createServer(handleRequest);
  
  server.listen(PORT, () => {
    spinner.succeed(chalk.green('Dashboard ready!'));
    
    console.log(chalk.cyan('\n' + '═'.repeat(60)));
    console.log(chalk.cyan('║') + chalk.white.bold('  📊 AI INFRASTRUCTURE DASHBOARD') + chalk.cyan(' '.repeat(24) + '║'));
    console.log(chalk.cyan('╠' + '═'.repeat(60) + '╣'));
    console.log(chalk.cyan('║') + chalk.gray('  Local:') + chalk.white(`   http://localhost:${PORT}`) + chalk.cyan(' '.repeat(28) + '║'));
    console.log(chalk.cyan('║') + chalk.gray('  Logs:') + chalk.white(`   ${LOG_FILE}`) + chalk.cyan(' '.repeat(30) + '║'));
    console.log(chalk.cyan('╠' + '═'.repeat(60) + '╣'));
    console.log(chalk.cyan('║') + chalk.gray('  Auto-refresh: Every 3 seconds') + chalk.cyan(' '.repeat(26) + '║'));
    console.log(chalk.cyan('║') + chalk.gray('  Press Ctrl+C to stop') + chalk.cyan(' '.repeat(33) + '║'));
    console.log(chalk.cyan('╚' + '═'.repeat(60) + '╝'));
    console.log('');
    
    // Try to open browser
    const url = `http://localhost:${PORT}`;
    
    const openCommand = process.platform === 'darwin' ? 'open' : 
                        process.platform === 'win32' ? 'start' : 'xdg-open';
    
    try {
      const proc = spawn(openCommand, [url], { detached: true, stdio: 'ignore' });
      proc.unref();
      console.log(chalk.green('✓ Opening browser...'));
    } catch {
      console.log(chalk.gray(`Open ${url} in your browser`));
    }
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(chalk.red(`\nPort ${PORT} is already in use`));
      console.error(chalk.gray('Try: lsof -ti:3456 | xargs kill -9\n'));
    } else {
      console.error(chalk.red('Server error:'), err);
    }
    process.exit(1);
  });
  
  // Handle cleanup
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nShutting down dashboard...'));
    server.close(() => {
      console.log(chalk.green('✓ Dashboard stopped\n'));
      process.exit(0);
    });
  });
}

// Only start server if called directly
if (process.argv[1]?.includes('server')) {
  startServer();
}

export { startServer };
