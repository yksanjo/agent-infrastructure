#!/usr/bin/env node

/**
 * AI Infrastructure Project Loop
 * Plan → Build (10 iterations) → Push to github.com/yksanjo
 */

import { spawn, execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync, readFileSync, appendFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, '..', '..', '..');

// Project configuration
const GITHUB_ORG = 'yksanjo';
const MAX_ITERATIONS = 10;

// MVP Project templates to create
const mvpProjects = [
  {
    name: 'agent-waf',
    description: 'Web Application Firewall for AI Agent Systems',
    vertical: 'security',
    type: 'infrastructure',
    language: 'typescript',
    features: ['request-filtering', 'rate-limiting', 'threat-detection', 'logging'],
  },
  {
    name: 'agent-observability',
    description: 'Observability platform for AI agent monitoring and tracing',
    vertical: 'monitoring',
    type: 'infrastructure',
    language: 'go',
    features: ['metrics', 'tracing', 'alerting', 'dashboard'],
  },
  {
    name: 'agent-gateway',
    description: 'API Gateway for AI agent communication and routing',
    vertical: 'networking',
    type: 'infrastructure',
    language: 'rust',
    features: ['routing', 'auth', 'load-balancing', 'caching'],
  },
  {
    name: 'agent-memory-store',
    description: 'Distributed memory store for AI agent state management',
    vertical: 'data',
    type: 'infrastructure',
    language: 'python',
    features: ['redis-compatible', 'persistence', 'clustering', 'ttl'],
  },
  {
    name: 'agent-orchestrator',
    description: 'Orchestration engine for multi-agent workflows',
    vertical: 'orchestration',
    type: 'framework',
    language: 'typescript',
    features: ['workflow-engine', 'task-queue', 'scheduling', 'retry'],
  },
  {
    name: 'agent-registry',
    description: 'Service registry and discovery for AI agents',
    vertical: 'infrastructure',
    type: 'service',
    language: 'go',
    features: ['service-discovery', 'health-checks', 'dns', 'api'],
  },
  {
    name: 'agent-policy-engine',
    description: 'Policy enforcement engine for AI agent governance',
    vertical: 'compliance',
    type: 'security',
    language: 'rust',
    features: ['policy-parser', 'enforcement', 'audit', 'reporting'],
  },
  {
    name: 'agent-cache',
    description: 'Intelligent caching layer for AI agent responses',
    vertical: 'performance',
    type: 'infrastructure',
    language: 'python',
    features: ['semantic-cache', 'invalidation', 'stats', 'api'],
  },
  {
    name: 'agent-queue',
    description: 'Message queue system for AI agent communication',
    vertical: 'messaging',
    type: 'infrastructure',
    language: 'typescript',
    features: ['pub-sub', 'priority', 'dead-letter', 'persistence'],
  },
  {
    name: 'agent-config',
    description: 'Configuration management for AI agent deployments',
    vertical: 'devops',
    type: 'tooling',
    language: 'go',
    features: ['hot-reload', 'versioning', 'encryption', 'validation'],
  },
];

let currentProjectIndex = 0;
let totalProjectsCreated = 0;
let startTime = null;

/**
 * Plan phase: Select next MVP project
 */
async function planPhase() {
  const spinner = ora(chalk.cyan('📋 Planning MVP project...')).start();
  
  if (currentProjectIndex >= mvpProjects.length) {
    spinner.succeed(chalk.yellow('All MVP projects completed!'));
    return null;
  }
  
  const project = mvpProjects[currentProjectIndex];
  const repoName = `agent-infra-${project.name}`;
  
  spinner.succeed(chalk.green(`✓ Planned: ${repoName}`));
  
  return {
    ...project,
    repoName,
    fullName: `${GITHUB_ORG}/${repoName}`,
  };
}

/**
 * Build phase: Create MVP project structure
 */
async function buildPhase(project, dryRun = false) {
  const spinner = ora(chalk.cyan(`  Building ${project.repoName}...`)).start();
  
  if (dryRun) {
    spinner.succeed(chalk.yellow(`  [DRY RUN] ${project.repoName}`));
    return { success: true, repo: project.repoName };
  }
  
  try {
    const projectDir = join(__root, project.repoName);
    
    // Clean if exists
    if (existsSync(projectDir)) {
      rmSync(projectDir, { recursive: true, force: true });
    }
    
    mkdirSync(projectDir, { recursive: true });
    
    // Create package.json / project config based on language
    await createProjectConfig(projectDir, project);
    
    // Create source structure
    await createSourceStructure(projectDir, project);
    
    // Create README
    await createReadme(projectDir, project);
    
    // Create .gitignore
    await createGitignore(projectDir, project);
    
    // Create LICENSE
    await createLicense(projectDir);
    
    // Create initial source files
    await createSourceFiles(projectDir, project);
    
    spinner.succeed(chalk.green(`  ✓ Built ${project.repoName}`));
    return { success: true, repo: project.repoName };
    
  } catch (error) {
    spinner.fail(chalk.red(`  ✗ Failed ${project.repoName}: ${error.message}`));
    return { success: false, repo: project.repoName, error: error.message };
  }
}

/**
 * Push phase: Initialize git and push to GitHub
 */
async function pushPhase(project, dryRun = false) {
  const spinner = ora(chalk.cyan(`  Pushing ${project.repoName}...`)).start();
  
  if (dryRun) {
    spinner.succeed(chalk.yellow(`  [DRY RUN] ${project.repoName}`));
    return { success: true, repo: project.repoName };
  }
  
  try {
    const projectDir = join(__root, project.repoName);
    
    // Initialize git repo
    await execCommand('git init', projectDir);
    await execCommand('git add .', projectDir);
    await execCommand(`git commit -m "Initial commit: ${project.description}"`, projectDir);
    
    // Create remote repo on GitHub
    await execCommand(
      `gh repo create ${project.fullName} --public --source=${projectDir} --push`,
      projectDir
    );
    
    spinner.succeed(chalk.green(`  ✓ Pushed to https://github.com/${project.fullName}`));
    return { 
      success: true, 
      repo: project.repoName, 
      url: `https://github.com/${project.fullName}` 
    };
    
  } catch (error) {
    spinner.fail(chalk.red(`  ✗ Failed ${project.repoName}: ${error.message}`));
    return { success: false, repo: project.repoName, error: error.message };
  }
}

/**
 * Create project configuration based on language
 */
async function createProjectConfig(dir, project) {
  const configs = {
    typescript: {
      'package.json': {
        name: project.repoName,
        version: '1.0.0',
        description: project.description,
        type: 'module',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
          build: 'tsc',
          dev: 'tsc --watch',
          start: 'node dist/index.js',
          test: 'vitest',
          lint: 'eslint src/',
        },
        keywords: ['ai', 'agent', 'infrastructure', project.vertical, project.type],
        author: 'Yoshi Kondo <yoshi@musicailab.com>',
        license: 'MIT',
        repository: {
          type: 'git',
          url: `https://github.com/${GITHUB_ORG}/${project.repoName}.git`,
        },
        devDependencies: {
          '@types/node': '^20.11.0',
          typescript: '^5.3.3',
          vitest: '^1.3.0',
          eslint: '^8.56.0',
        },
        dependencies: {},
      },
      'tsconfig.json': {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          lib: ['ES2022'],
          declaration: true,
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: 'node',
          resolveJsonModule: true,
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist'],
      },
    },
    python: {
      'pyproject.toml': `[project]
name = "${project.repoName}"
version = "1.0.0"
description = "${project.description}"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [{name = "Yoshi Kondo", email = "yoshi@musicailab.com"}]
keywords = ["ai", "agent", "infrastructure", "${project.vertical}"]
dependencies = []

[project.optional-dependencies]
dev = ["pytest", "black", "mypy", "ruff"]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]
`,
    },
    go: {
      'go.mod': `module github.com/${GITHUB_ORG}/${project.repoName}

go 1.21

require (
)
`,
    },
    rust: {
      'Cargo.toml': `[package]
name = "${project.repoName}"
version = "1.0.0"
edition = "2021"
description = "${project.description}"
license = "MIT"
authors = ["Yoshi Kondo <yoshi@musicailab.com>"]
keywords = ["ai", "agent", "infrastructure", "${project.vertical}"]
repository = "https://github.com/${GITHUB_ORG}/${project.repoName}"

[dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[dev-dependencies]
criterion = "0.5"
`,
    },
  };
  
  const config = configs[project.language] || configs.typescript;
  
  for (const [filename, content] of Object.entries(config)) {
    const filepath = join(dir, filename);
    if (typeof content === 'string') {
      writeFileSync(filepath, content);
    } else {
      writeFileSync(filepath, JSON.stringify(content, null, 2));
    }
  }
}

/**
 * Create source directory structure
 */
async function createSourceStructure(dir, project) {
  const structures = {
    typescript: ['src', 'src/lib', 'src/api', 'src/utils', 'tests'],
    python: ['src', `src/${project.repoName.replace(/-/g, '_')}`, 'tests'],
    go: ['cmd', 'internal', 'pkg', 'api'],
    rust: ['src', 'src/bin', 'src/lib'],
  };
  
  const structure = structures[project.language] || structures.typescript;
  
  for (const subdir of structure) {
    mkdirSync(join(dir, subdir), { recursive: true });
  }
}

/**
 * Create README
 */
async function createReadme(dir, project) {
  const readme = `# ${project.repoName}

${project.description}

## Features

${project.features.map(f => `- ✅ ${f}`).join('\n')}

## Installation

${getInstallationInstructions(project)}

## Usage

${getUsageInstructions(project)}

## API

${getApiDocs(project)}

## Development

\`\`\`bash
git clone https://github.com/${GITHUB_ORG}/${project.repoName}.git
cd ${project.repoName}
${getDevInstructions(project)}
\`\`\`

## License

MIT - Yoshi Kondo

## Part of Agent Infrastructure

This project is part of the [Agent Infrastructure](https://github.com/${GITHUB_ORG}/agent-infrastructure) initiative.
`;
  
  writeFileSync(join(dir, 'README.md'), readme);
}

/**
 * Create .gitignore
 */
async function createGitignore(dir, project) {
  const gitignores = {
    typescript: `node_modules
dist
.env
.env.local
*.log
coverage
.nyc_output
.DS_Store
`,
    python: `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
*.egg-info/
dist/
build/
.env
*.log
.DS_Store
`,
    go: `bin/
pkg/
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
.env
.DS_Store
`,
    rust: `target/
**/*.rs.bk
Cargo.lock
.env
.DS_Store
`,
  };
  
  const gitignore = gitignores[project.language] || gitignores.typescript;
  writeFileSync(join(dir, '.gitignore'), gitignore);
}

/**
 * Create LICENSE
 */
async function createLicense(dir) {
  const license = `MIT License

Copyright (c) 2026 Yoshi Kondo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
  writeFileSync(join(dir, 'LICENSE'), license);
}

/**
 * Create initial source files
 */
async function createSourceFiles(dir, project) {
  const files = {
    typescript: {
      'src/index.ts': `/**
 * ${project.repoName}
 * ${project.description}
 */

export interface Config {
  debug?: boolean;
  [key: string]: any;
}

export class ${camelCase(project.name)} {
  private config: Config;

  constructor(config: Config = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('Initializing ${project.repoName}...');
    // Initialization logic
  }

  async execute(input: any): Promise<any> {
    console.log('Executing with input:', input);
    return { success: true };
  }
}

export default ${camelCase(project.name)};
`,
      'tests/index.test.ts': `import { describe, it, expect } from 'vitest';
import ${camelCase(project.name)} from '../src/index';

describe('${camelCase(project.name)}', () => {
  it('should initialize', async () => {
    const instance = new ${camelCase(project.name)}();
    await instance.initialize();
    expect(instance).toBeDefined();
  });
});
`,
    },
    python: {
      [`src/${project.name.replace(/-/g, '_')}/__init__.py`]: `"""
${project.repoName}
${project.description}
"""

__version__ = "1.0.0"

class ${pascalCase(project.name)}:
    def __init__(self, config: dict = None):
        self.config = config or {}
    
    async initialize(self) -> None:
        print(f"Initializing ${project.repoName}...")
    
    async execute(self, input_data: any) -> dict:
        print(f"Executing with input: {input_data}")
        return {"success": True}
`,
      'tests/test_init.py': `import pytest
from ${project.name.replace(/-/g, '_')} import ${pascalCase(project.name)}

@pytest.mark.asyncio
async def test_initialize():
    instance = ${pascalCase(project.name)}()
    await instance.initialize()
    assert instance is not None
`,
    },
    go: {
      'cmd/main.go': `package main

import (
	"fmt"
	"log"
)

func main() {
	fmt.Println("${project.repoName} starting...")
	
	// Initialize
	if err := initialize(); err != nil {
		log.Fatal(err)
	}
	
	fmt.Println("${project.repoName} ready")
}

func initialize() error {
	// Initialization logic
	return nil
}
`,
      'internal/${project.name}/${project.name}.go': `package ${project.name.replace(/-/g, '')}

// Config holds the configuration
type Config struct {
	Debug bool
}

// ${pascalCase(project.name)} is the main struct
type ${pascalCase(project.name)} struct {
	config Config
}

// New creates a new instance
func New(config Config) *${pascalCase(project.name)} {
	return &${pascalCase(project.name)}{config: config}
}

// Initialize sets up the component
func (a *${pascalCase(project.name)}) Initialize() error {
	return nil
}

// Execute runs the main logic
func (a *${pascalCase(project.name)}) Execute(input interface{}) (interface{}, error) {
	return map[string]interface{}{"success": true}, nil
}
`,
    },
    rust: {
      'src/lib.rs': `//! ${project.repoName}
//! ${project.description}

use serde::{Deserialize, Serialize};

/// Configuration for ${project.name}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub debug: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self { debug: false }
    }
}

/// Main ${pascalCase(project.name)} struct
pub struct ${pascalCase(project.name)} {
    config: Config,
}

impl ${pascalCase(project.name)} {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn initialize(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("Initializing ${project.repoName}...");
        Ok(())
    }

    pub async fn execute(&self, input: serde_json::Value) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        println!("Executing with input: {:?}", input);
        Ok(serde_json::json!({"success": true}))
    }
}
`,
      'src/main.rs': `use ${project.name.replace(/-/g, '_')}::${pascalCase(project.name)};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("${project.repoName} starting...");
    
    let agent = ${pascalCase(project.name)}::default();
    agent.initialize().await?;
    
    println!("${project.repoName} ready");
    Ok(())
}
`,
    },
  };
  
  const projectFiles = files[project.language] || files.typescript;
  
  for (const [filename, content] of Object.entries(projectFiles)) {
    const filepath = join(dir, filename);
    mkdirSync(dirname(filepath), { recursive: true });
    writeFileSync(filepath, content);
  }
}

/**
 * Execute shell command
 */
function execCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    const [command, ...args] = cmd.split(' ');
    const proc = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Exit code: ${code}`));
      }
    });
    
    proc.on('error', reject);
  });
}

/**
 * Log iteration
 */
function logIteration(iteration, project, result, duration) {
  const logFile = join(__root, 'agent-infra-loop-log.json');
  const webLogFile = join(__dirname, '..', '..', 'logs.json');

  const logEntry = {
    timestamp: new Date().toISOString(),
    iteration,
    project: project?.repoName,
    result,
    duration,
    totalProjects: totalProjectsCreated,
  };

  let logs = [];
  if (existsSync(logFile)) {
    try {
      logs = JSON.parse(readFileSync(logFile, 'utf8'));
    } catch {
      logs = [];
    }
  }

  logs.push(logEntry);
  writeFileSync(logFile, JSON.stringify(logs, null, 2));
  
  // Also write to web dashboard location
  writeFileSync(webLogFile, JSON.stringify(logs, null, 2));

  // Text log
  const textLogFile = join(__root, 'agent-infra-loop.log');
  const textLog = `[${new Date().toISOString()}] Iteration ${iteration}: ${project?.repoName || 'COMPLETED'} | Status: ${result.success ? 'SUCCESS' : 'FAILED'} | Duration: ${duration}ms\n`;
  appendFileSync(textLogFile, textLog);
}

/**
 * Display statistics
 */
function displayStats() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.white.bold('  AI INFRASTRUCTURE PROJECT LOOP'));
  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.gray(`  Total Iterations:    ${chalk.white(currentProjectIndex)}/${MAX_ITERATIONS}`));
  console.log(chalk.gray(`  Projects Created:    ${chalk.green(totalProjectsCreated)}`));
  console.log(chalk.gray(`  Elapsed Time:        ${chalk.yellow(`${hours}h ${minutes}m ${seconds}s`)}`));
  console.log(chalk.gray(`  GitHub Org:          ${chalk.blue(GITHUB_ORG)}`));
  console.log(chalk.cyan('='.repeat(60)) + '\n');
}

/**
 * Main loop function
 */
async function runLoop(options = {}) {
  const { dryRun = false } = options;
  
  startTime = Date.now();
  
  console.log(chalk.cyan('\n' + '█'.repeat(60)));
  console.log(chalk.cyan('█') + chalk.white.bold('  AI INFRASTRUCTURE PROJECT LOOP') + chalk.cyan('█'));
  console.log(chalk.cyan('█') + chalk.gray('  Plan → Build → Push (10 MVP Projects)') + chalk.cyan('█'));
  console.log(chalk.cyan('█') + chalk.gray(`  Target: github.com/${GITHUB_ORG}`) + chalk.cyan('█'));
  console.log(chalk.cyan('█'.repeat(60)) + '\n');
  
  if (dryRun) {
    console.log(chalk.yellow('⚠️  DRY RUN MODE - No actual repos will be created\n'));
  }
  
  console.log(chalk.white('MVP Projects to Create:'));
  mvpProjects.forEach((p, i) => {
    const repoName = `agent-infra-${p.name}`;
    console.log(chalk.gray(`  ${i + 1}. ${repoName} (${p.language}) - ${p.description.split(' ')[0]}`));
  });
  console.log('');
  
  // Handle graceful shutdown
  let shouldStop = false;
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n⚠️  Received SIGINT, stopping loop...'));
    shouldStop = true;
  });
  
  process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n\n⚠️  Received SIGTERM, stopping loop...'));
    shouldStop = true;
  });
  
  while (!shouldStop && currentProjectIndex < MAX_ITERATIONS) {
    const iterationStart = Date.now();
    const iterationNum = currentProjectIndex + 1;
    
    console.log(chalk.cyan(`\n${'─'.repeat(60)}`));
    console.log(chalk.white.bold(`ITERATION ${iterationNum}/${MAX_ITERATIONS}`));
    console.log(chalk.cyan('─'.repeat(60)) + '\n');
    
    // Plan Phase
    const project = await planPhase();
    
    if (!project) {
      console.log(chalk.green('\n✓ All MVP projects completed!'));
      break;
    }
    
    // Build Phase
    console.log(chalk.cyan('\n🔨 Build Phase:'));
    const buildResult = await buildPhase(project, dryRun);
    
    // Push Phase
    console.log(chalk.cyan('\n🚀 Push Phase:'));
    const pushResult = await pushPhase(project, dryRun);
    
    // Update totals
    if (pushResult.success) {
      totalProjectsCreated++;
    }
    
    currentProjectIndex++;
    
    // Log iteration
    const duration = Date.now() - iterationStart;
    logIteration(iterationNum, project, pushResult, duration);
    
    // Display iteration summary
    console.log(chalk.cyan('\n📊 Iteration Summary:'));
    console.log(chalk.gray(`  Project:  ${chalk.white(project.repoName)}`));
    console.log(chalk.gray(`  Language: ${chalk.yellow(project.language)}`));
    console.log(chalk.gray(`  Status:   ${pushResult.success ? chalk.green('✓ SUCCESS') : chalk.red('✗ FAILED')}`));
    if (pushResult.url) {
      console.log(chalk.gray(`  URL:      ${chalk.blue(pushResult.url)}`));
    }
    console.log(chalk.gray(`  Duration: ${chalk.yellow(`${duration}ms`)}`));
    
    displayStats();
  }
  
  // Final stats
  displayStats();
  console.log(chalk.green('✓ Loop completed successfully\n'));
  
  return {
    iterations: currentProjectIndex,
    totalProjects: totalProjectsCreated,
    duration: Date.now() - startTime,
  };
}

/**
 * Interactive mode
 */
async function interactiveMode() {
  console.log(chalk.cyan('\n🎯 AI Infrastructure Project Loop Configuration\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Run in dry-run mode (no actual creation)?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: `Create ${MAX_ITERATIONS} MVP projects and push to github.com/${GITHUB_ORG}?`,
      default: false,
    },
  ]);
  
  if (!answers.confirm && !answers.dryRun) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }
  
  await runLoop({ dryRun: answers.dryRun });
}

// Helper functions
function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function pascalCase(str) {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function getInstallationInstructions(project) {
  const instructions = {
    typescript: `\`\`\`bash
npm install ${project.repoName}
\`\`\``,
    python: `\`\`\`bash
pip install ${project.repoName}
\`\`\``,
    go: `\`\`\`bash
go get github.com/${GITHUB_ORG}/${project.repoName}
\`\`\``,
    rust: `\`\`\`toml
[dependencies]
${project.repoName} = "1.0"
\`\`\``,
  };
  
  return instructions[project.language] || instructions.typescript;
}

function getUsageInstructions(project) {
  const instructions = {
    typescript: `\`\`\`typescript
import { ${pascalCase(project.name)} } from '${project.repoName}';

const agent = new ${pascalCase(project.name)}();
await agent.initialize();
const result = await agent.execute({ task: 'your task' });
\`\`\``,
    python: `\`\`\`python
from ${project.name.replace(/-/g, '_')} import ${pascalCase(project.name)}

agent = ${pascalCase(project.name)}()
await agent.initialize()
result = await agent.execute({'task': 'your task'})
\`\`\``,
    go: `\`\`\`go
import "${GITHUB_ORG}/${project.repoName}"

agent := ${camelCase(project.name)}.New(${camelCase(project.name)}.Config{})
agent.Initialize()
result := agent.Execute(input)
\`\`\``,
    rust: `\`\`\`rust
use ${project.name.replace(/-/g, '_')}::${pascalCase(project.name)};

let agent = ${pascalCase(project.name)}::new(Config::default());
agent.initialize().await?;
let result = agent.execute(input).await?;
\`\`\``,
  };
  
  return instructions[project.language] || instructions.typescript;
}

function getApiDocs(project) {
  return `See [API Documentation](docs/API.md) for complete reference.

### Key Methods

- \`initialize()\` - Initialize the component
- \`execute(input)\` - Execute main logic
- \`configure(config)\` - Update configuration
`;
}

function getDevInstructions(project) {
  const instructions = {
    typescript: `npm install
npm run dev`,
    python: `pip install -e ".[dev]"
pytest`,
    go: `go mod tidy
go test ./...`,
    rust: `cargo build
cargo test`,
  };
  
  return instructions[project.language] || instructions.typescript;
}

export { runLoop, interactiveMode };
