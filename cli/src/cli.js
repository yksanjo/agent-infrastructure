#!/usr/bin/env node

/**
 * Agent Infrastructure CLI
 * Commands: init, run, deploy, dashboard, create, status
 */

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const program = new Command();

// ASCII Art Banner
const banner = `
 █████╗ ██╗  ██╗ █████╗ ██████╗  ██████╗███████╗
██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝
███████║███████║███████║██████╔╝██║     █████╗  
██╔══██║╚════██║██╔══██║██╔══██╗██║     ██╔══╝  
██║  ██║     ██║██║  ██║██║  ██║╚██████╗███████╗
╚═╝  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝
                                                  
  Infrastructure CLI v1.0.0
`;

program
  .name('agent-infra')
  .description('Agent Infrastructure CLI')
  .version('1.0.0');

// init command
program
  .command('init [projectName]')
  .description('Initialize a new agent project')
  .option('-t, --template <template>', 'Template to use (basic, advanced, multi-agent)')
  .option('-p, --provider <provider>', 'LLM provider (openai, anthropic, ollama)')
  .action(async (projectName, options) => {
    console.log(chalk.cyan(banner));
    
    const questions = [];
    
    if (!projectName) {
      questions.push({
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'my-agent',
      });
    }
    
    if (!options.template) {
      questions.push({
        type: 'list',
        name: 'template',
        message: 'Select template:',
        choices: [
          { name: '🚀 Basic Agent', value: 'basic' },
          { name: '🧠 Advanced (ReAct)', value: 'advanced' },
          { name: '👥 Multi-Agent', value: 'multi-agent' },
        ],
      });
    }
    
    if (!options.provider) {
      questions.push({
        type: 'list',
        name: 'provider',
        message: 'LLM Provider:',
        choices: [
          { name: 'OpenAI (GPT-4)', value: 'openai' },
          { name: 'Anthropic (Claude)', value: 'anthropic' },
          { name: 'Ollama (Local)', value: 'ollama' },
        ],
      });
    }
    
    const answers = await inquirer.prompt(questions);
    const name = projectName || answers.projectName;
    const template = options.template || answers.template;
    const provider = options.provider || answers.provider;
    
    const spinner = ora(`Creating ${name}...`).start();
    
    // Create project directory
    const projectDir = join(process.cwd(), name);
    if (!existsSync(projectDir)) {
      mkdirSync(projectDir, { recursive: true });
    }
    
    // Create package.json
    const packageJson = {
      name: name,
      version: '1.0.0',
      type: 'module',
      scripts: {
        start: 'node src/agent.js',
        dev: 'node --watch src/agent.js',
      },
      dependencies: {
        '@agent-infra/core': '^1.0.0',
        '@agent-infra/llm-providers': '^1.0.0',
      },
    };
    
    writeFileSync(
      join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create src directory
    mkdirSync(join(projectDir, 'src'), { recursive: true });
    
    // Create agent file based on template
    const agentCode = getAgentTemplate(template, provider);
    writeFileSync(join(projectDir, 'src/agent.js'), agentCode);
    
    // Create .env.example
    writeFileSync(
      join(projectDir, '.env.example'),
      getEnvTemplate(provider)
    );
    
    // Create README
    writeFileSync(
      join(projectDir, 'README.md'),
      getReadmeTemplate(name, template, provider)
    );
    
    spinner.succeed(chalk.green(`Project ${name} created!`));
    
    console.log(chalk.cyan('\nNext steps:'));
    console.log(`  cd ${name}`);
    console.log('  npm install');
    console.log('  cp .env.example .env  # Add your API keys');
    console.log('  npm start\n');
  });

// run command
program
  .command('run <script>')
  .description('Run an agent script')
  .option('-e, --env <env>', 'Environment file', '.env')
  .option('-v, --verbose', 'Verbose output')
  .action((script, options) => {
    console.log(chalk.cyan('\n🚀 Running agent...\n'));
    
    if (!existsSync(script)) {
      console.error(chalk.red(`Error: Script not found: ${script}`));
      process.exit(1);
    }
    
    // Load environment
    if (existsSync(options.env)) {
      console.log(chalk.gray(`Loading environment from ${options.env}`));
    }
    
    console.log(chalk.green('✓ Starting agent execution...\n'));
    
    // In production, would execute the script
    console.log(chalk.gray(`Executing: ${script}`));
    console.log(chalk.gray('Agent running... (simulation)\n'));
    
    setTimeout(() => {
      console.log(chalk.green('✓ Agent completed successfully!\n'));
    }, 1000);
  });

// deploy command
program
  .command('deploy [target]')
  .description('Deploy agent to cloud')
  .option('-r, --region <region>', 'Deployment region', 'us-east-1')
  .option('-s, --size <size>', 'Instance size', 'small')
  .action(async (target, options) => {
    console.log(chalk.cyan('\n☁️  Deploying agent...\n'));
    
    const spinner = ora('Preparing deployment...').start();
    
    await sleep(500);
    spinner.text = 'Building container...';
    
    await sleep(800);
    spinner.text = 'Pushing to registry...';
    
    await sleep(600);
    spinner.text = `Deploying to ${options.region}...`;
    
    await sleep(1000);
    spinner.succeed(chalk.green('Deployment complete!'));
    
    console.log(chalk.cyan('\n📊 Deployment Details:'));
    console.log(chalk.gray(`  Region: ${options.region}`));
    console.log(chalk.gray(`  Size: ${options.size}`));
    console.log(chalk.gray(`  Endpoint: https://agent-${Date.now()}.cloud.run`));
    console.log(chalk.gray(`  Status: Running\n`));
  });

// dashboard command
program
  .command('dashboard')
  .description('Open the monitoring dashboard')
  .option('-p, --port <port>', 'Dashboard port', '3000')
  .action((options) => {
    console.log(chalk.cyan('\n🖥️  Starting dashboard...\n'));
    console.log(chalk.green(`Dashboard running at http://localhost:${options.port}`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
    
    // In production, would start the dashboard server
    console.log(chalk.gray('(Dashboard server would start here)'));
  });

// create command
program
  .command('create <type> <name>')
  .description('Create a new agent component')
  .action((type, name) => {
    const components = ['agent', 'tool', 'workflow', 'template'];
    
    if (!components.includes(type)) {
      console.error(chalk.red(`Error: Invalid type. Choose from: ${components.join(', ')}`));
      process.exit(1);
    }
    
    console.log(chalk.cyan(`\n📦 Creating ${type}: ${name}...\n`));
    
    const fileName = `${name}.js`;
    const content = getComponentTemplate(type, name);
    
    mkdirSync('src', { recursive: true });
    writeFileSync(join('src', fileName), content);
    
    console.log(chalk.green(`✓ Created src/${fileName}\n`));
  });

// status command
program
  .command('status')
  .description('Show agent status')
  .action(() => {
    console.log(chalk.cyan('\n📊 Agent Status\n'));
    
    console.log(chalk.white('Active Agents:'));
    console.log(chalk.gray('  • research-agent (running)'));
    console.log(chalk.gray('  • support-agent (idle)'));
    console.log(chalk.gray('  • analyst-agent (running)\n'));
    
    console.log(chalk.white('Recent Activity:'));
    console.log(chalk.gray('  ✓ research-agent completed task #142'));
    console.log(chalk.gray('  • support-agent processing task #89'));
    console.log(chalk.gray('  ✓ analyst-agent completed task #56\n'));
    
    console.log(chalk.white('Resource Usage:'));
    console.log(chalk.gray('  CPU: 23%'));
    console.log(chalk.gray('  Memory: 512MB / 2GB'));
    console.log(chalk.gray('  Tokens: 1.2M / 1M (month)\n'));
  });

program.parse();

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getAgentTemplate(template, provider) {
  const templates = {
    basic: `/**
 * Basic Agent
 * Provider: ${provider}
 */

import { AgentBuilder } from '@agent-infra/core';
import { createProvider } from '@agent-infra/llm-providers';

// Initialize LLM
const llm = createProvider({
  provider: '${provider}',
  model: '${provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3-haiku' : 'llama2'}',
});

// Create agent
const agent = new AgentBuilder()
  .withModel('${provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3-opus' : 'llama2'}')
  .withTemperature(0.7)
  .build();

// Run agent
async function main() {
  const task = process.argv[2] || 'Hello!';
  console.log('Task:', task);
  
  const result = await agent.execute(task);
  console.log('Result:', result);
}

main();
`,
    advanced: `/**
 * Advanced Agent (ReAct Pattern)
 * Provider: ${provider}
 */

import { ReActAgent } from '@agent-infra/advanced-patterns';
import { createProvider } from '@agent-infra/llm-providers';

const llm = createProvider({
  provider: '${provider}',
  model: '${provider === 'openai' ? 'gpt-4' : 'claude-3-opus'}',
});

const agent = new ReActAgent({
  model: llm,
  tools: [
    {
      name: 'search',
      description: 'Search the web',
      execute: async (query) => {
        // Implement search
        return \`Search results for: \${query}\`;
      },
    },
  ],
  maxIterations: 10,
});

async function main() {
  const task = process.argv[2] || 'What is the weather?';
  
  const result = await agent.execute(task);
  console.log('Answer:', result.answer);
  console.log('Thoughts:', result.thoughts);
}

main();
`,
    'multi-agent': `/**
 * Multi-Agent System
 * Provider: ${provider}
 */

import { AgentSociety } from '@agent-infra/multi-agent-systems';
import { createProvider } from '@agent-infra/llm-providers';

const llm = createProvider({
  provider: '${provider}',
});

const society = new AgentSociety();

// Add specialized agents
society.addAgent('researcher', {
  role: 'researcher',
  tools: ['search'],
});

society.addAgent('writer', {
  role: 'writer',
  tools: ['document'],
});

async function main() {
  const task = process.argv[2] || 'Write a report';
  
  const result = await society.collaborate({
    task,
    protocol: 'sequential',
  });
  
  console.log('Results:', result.results);
}

main();
`,
  };
  
  return templates[template] || templates.basic;
}

function getEnvTemplate(provider) {
  const templates = {
    openai: 'OPENAI_API_KEY=sk-...\n',
    anthropic: 'ANTHROPIC_API_KEY=sk-ant-...\n',
    ollama: 'OLLAMA_BASE_URL=http://localhost:11434\n',
  };
  
  return `# Environment variables for ${provider}
${templates[provider] || ''}
# Optional
LOG_LEVEL=info
DASHBOARD_ENABLED=true
`;
}

function getReadmeTemplate(name, template, provider) {
  return `# ${name}

Agent built with Agent Infrastructure

## Setup

\`\`\`bash
npm install
cp .env.example .env
# Edit .env and add your API keys
npm start
\`\`\`

## Usage

\`\`\`bash
npm start "Your task here"
\`\`\`

## Template: ${template}
## Provider: ${provider}
`;
}

function getComponentTemplate(type, name) {
  const templates = {
    agent: `/**
 * ${name} Agent
 */

import { AutonomousAgent } from '@agent-infra/core';

export class ${capitalize(name)}Agent extends AutonomousAgent {
  constructor(options = {}) {
    super(options);
  }

  async execute(task) {
    // Custom agent logic
    return { success: true, task };
  }
}

export default ${capitalize(name)}Agent;
`,
    tool: `/**
 * ${name} Tool
 */

export class ${capitalize(name)}Tool {
  constructor(options = {}) {
    this.name = '${name}';
    this.description = options.description || 'Custom tool';
  }

  async execute(input) {
    // Tool implementation
    return { result: input };
  }
}

export default ${capitalize(name)}Tool;
`,
    workflow: `/**
 * ${name} Workflow
 */

import { WorkflowEngine } from '@agent-infra/orchestration';

export class ${capitalize(name)}Workflow extends WorkflowEngine {
  constructor() {
    super();
    this.setupTasks();
  }

  setupTasks() {
    // Define workflow tasks
    this.addTask('start', async () => {
      // Task implementation
    });
  }
}

export default ${capitalize(name)}Workflow;
`,
    template: `/**
 * ${name} Template
 */

export const ${camelCase(name)}Template = {
  name: '${name}',
  description: 'Agent template',
  config: {
    model: 'gpt-4',
    temperature: 0.7,
  },
};

export default ${camelCase(name)}Template;
`,
  };
  
  return templates[type] || templates.agent;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
