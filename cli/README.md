# Agent Infrastructure CLI

[![npm version](https://img.shields.io/npm/v/agent-infra-cli.svg)](https://www.npmjs.com/package/agent-infra-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> CLI tool for Agent Infrastructure - Initialize, Run, Deploy agents

## 📦 Installation

```bash
# Install globally
npm install -g agent-infra-cli

# Or use with npx
npx agent-infra <command>
```

## 🚀 Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize a new agent project |
| `run` | Run an agent script |
| `deploy` | Deploy agent to cloud |
| `dashboard` | Open monitoring dashboard |
| `create` | Create agent components |
| `status` | Show agent status |

## 📖 Usage

### Initialize a new project

```bash
# Interactive mode
agent-infra init

# With options
agent-infra init my-agent -t advanced -p openai
```

### Run an agent

```bash
agent-infra run src/agent.js
agent-infra run src/agent.js --verbose
```

### Deploy

```bash
agent-infra deploy production
agent-infra deploy -r us-west-2 -s medium
```

### Create components

```bash
agent-infra create agent research
agent-infra create tool web-search
agent-infra create workflow data-pipeline
```

### Dashboard

```bash
agent-infra dashboard
agent-infra dashboard -p 8080
```

## 🎯 Examples

```bash
# Create a new advanced agent with OpenAI
agent-infra init research-bot -t advanced -p openai
cd research-bot
npm install

# Create additional components
agent-infra create tool search
agent-infra create workflow research-flow

# Run the agent
agent-infra run src/agent.js "Research AI trends"

# Deploy to cloud
agent-infra deploy production -r us-east-1

# Monitor with dashboard
agent-infra dashboard
```

## 📝 License

MIT License
