#!/usr/bin/env node

/**
 * Loop Visualization Dashboard
 * Real-time terminal UI for monitoring the AI Infrastructure Loop
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, '..', '..', '..');

const LOG_FILE = join(__root, 'agent-infra-loop-log.json');

// Project info
const projects = [
  { name: 'agent-waf', language: 'typescript', icon: '🔒' },
  { name: 'agent-observability', language: 'go', icon: '📊' },
  { name: 'agent-gateway', language: 'rust', icon: '🌐' },
  { name: 'agent-memory-store', language: 'python', icon: '💾' },
  { name: 'agent-orchestrator', language: 'typescript', icon: '🎯' },
  { name: 'agent-registry', language: 'go', icon: '📋' },
  { name: 'agent-policy-engine', language: 'rust', icon: '🛡️' },
  { name: 'agent-cache', language: 'python', icon: '⚡' },
  { name: 'agent-queue', language: 'typescript', icon: '📨' },
  { name: 'agent-config', language: 'go', icon: '⚙️' },
];

const GITHUB_ORG = 'yksanjo';

/**
 * Clear terminal
 */
function clear() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

/**
 * Get progress data
 */
function getProgress() {
  if (!existsSync(LOG_FILE)) {
    return { iterations: 0, projects: [], totalCreated: 0 };
  }
  
  try {
    const logs = JSON.parse(readFileSync(LOG_FILE, 'utf8'));
    return {
      iterations: logs.length,
      projects: logs,
      totalCreated: logs.filter(l => l.result?.success).length,
      lastUpdate: logs[logs.length - 1]?.timestamp,
    };
  } catch {
    return { iterations: 0, projects: [], totalCreated: 0 };
  }
}

/**
 * Render progress bar
 */
function renderProgressBar(current, total, width = 30) {
  const percent = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((width * current) / total);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${percent}%`;
}

/**
 * Get language color
 */
function getLanguageColor(lang) {
  const colors = {
    typescript: chalk.blue,
    javascript: chalk.yellow,
    python: chalk.green,
    go: chalk.cyan,
    rust: chalk.red,
  };
  return colors[lang] || chalk.white;
}

/**
 * Render dashboard
 */
function renderDashboard() {
  const progress = getProgress();
  
  clear();
  
  // Header
  console.log(chalk.cyan('\n' + '═'.repeat(70)));
  console.log(chalk.cyan('║') + chalk.white.bold('  🚀 AI INFRASTRUCTURE LOOP - DASHBOARD') + chalk.cyan(' '.repeat(26) + '║'));
  console.log(chalk.cyan('║') + chalk.gray(`  Target: github.com/${GITHUB_ORG}`) + chalk.cyan(' '.repeat(34) + '║'));
  console.log(chalk.cyan('╠' + '═'.repeat(69) + '╣'));
  
  // Overall Progress
  const totalProjects = projects.length;
  const completed = Math.min(progress.iterations, totalProjects);
  const success = progress.totalCreated;
  
  console.log(chalk.cyan('║') + chalk.white.bold('  OVERALL PROGRESS') + chalk.cyan(' '.repeat(49) + '║'));
  console.log(chalk.cyan('║') + '  ' + renderProgressBar(completed, totalProjects, 50) + chalk.cyan(' '.repeat(15) + '║'));
  console.log(chalk.cyan('║') + chalk.gray(`  Completed: ${completed}/${totalProjects}  |  Success: ${success}  |  Pending: ${totalProjects - completed}`) + chalk.cyan(' '.repeat(10) + '║'));
  console.log(chalk.cyan('╠' + '═'.repeat(69) + '╣'));
  
  // Project Status
  console.log(chalk.cyan('║') + chalk.white.bold('  PROJECT STATUS') + chalk.cyan(' '.repeat(53) + '║'));
  console.log(chalk.cyan('╠' + '═'.repeat(69) + '╣'));
  
  projects.forEach((project, index) => {
    const status = progress.projects[index];
    const statusIcon = status 
      ? (status.result?.success ? chalk.green('✓') : chalk.red('✗'))
      : chalk.gray('○');
    
    const statusText = status 
      ? (status.result?.success ? chalk.green('COMPLETED') : chalk.red('FAILED'))
      : chalk.gray('PENDING');
    
    const langColor = getLanguageColor(project.language);
    const lang = langColor(project.language.toUpperCase());
    
    const url = status?.result?.url || `https://github.com/${GITHUB_ORG}/agent-infra-${project.name}`;
    
    console.log(chalk.cyan('║') + 
      `  ${statusIcon} ${project.icon} ${project.name.padEnd(25)} ${lang.padEnd(11)} ${statusText.padEnd(12)}` + 
      chalk.cyan('║'));
    
    if (status?.result?.url) {
      console.log(chalk.cyan('║') + 
        `     ${chalk.blue(url)}` + 
        chalk.cyan(' '.repeat(69 - url.length - 5) + '║'));
    }
  });
  
  console.log(chalk.cyan('╠' + '═'.repeat(69) + '╣'));
  
  // Statistics
  console.log(chalk.cyan('║') + chalk.white.bold('  STATISTICS') + chalk.cyan(' '.repeat(57) + '║'));
  console.log(chalk.cyan('║') + chalk.gray(`  Last Update: ${progress.lastUpdate || 'N/A'}`) + chalk.cyan(' '.repeat(35) + '║'));
  console.log(chalk.cyan('║') + chalk.gray(`  Success Rate: ${progress.iterations > 0 ? Math.round((success / progress.iterations) * 100) : 0}%`) + chalk.cyan(' '.repeat(42) + '║'));
  console.log(chalk.cyan('╚' + '═'.repeat(69) + '╝'));
  
  console.log(chalk.gray('\nPress Ctrl+C to exit | Auto-refresh every 2 seconds\n'));
}

/**
 * Watch mode - auto refresh
 */
function watchMode() {
  let lastSize = 0;
  
  // Initial render
  renderDashboard();
  
  // Poll for changes
  const interval = setInterval(() => {
    if (!existsSync(LOG_FILE)) {
      return;
    }
    
    try {
      const stats = statSync(LOG_FILE);
      if (stats.size !== lastSize) {
        lastSize = stats.size;
        renderDashboard();
      }
    } catch {
      // File might be locked
    }
  }, 2000);
  
  // Handle cleanup
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(chalk.green('\n✓ Dashboard closed\n'));
    process.exit(0);
  });
}

/**
 * Static view (no refresh)
 */
function staticView() {
  renderDashboard();
  process.exit(0);
}

// Main - only run if called directly
const args = process.argv.slice(2);
const watch = args.includes('--watch') || args.includes('-w');

// Only run if this is the main module
if (process.argv[1]?.includes('dashboard')) {
  if (watch) {
    watchMode();
  } else {
    staticView();
  }
}

export { watchMode, staticView };
