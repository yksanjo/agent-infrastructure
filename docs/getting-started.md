# Getting Started

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/yksanjo/agent-infrastructure.git
cd agent-infrastructure

# Install dependencies
npm install
```

## Quick Start

### 1. Create an Agent

```javascript
import { AgentBuilder } from '@agent-infra/core';

const agent = new AgentBuilder()
  .withModel('gpt-4')
  .withTools(['search', 'calculator'])
  .build();

const result = await agent.execute('What is 2 + 2?');
console.log(result);
```

### 2. Set Up Memory

```javascript
import { VectorStore, ConversationMemory } from '@agent-infra/memory';

const memory = new ConversationMemory({ maxMessages: 100 });
memory.add({ role: 'user', content: 'Hello!' });
memory.add({ role: 'assistant', content: 'Hi there!' });

const history = memory.get();
```

### 3. Create a Workflow

```javascript
import { WorkflowEngine } from '@agent-infra/orchestration';

const workflow = new WorkflowEngine()
  .addTask('fetch', async () => {/* ... */})
  .addTask('process', async (data) => {/* ... */})
  .dependsOn('process', ['fetch'])
  .build();

await workflow.execute();
```

## Next Steps

- Explore [examples](../examples) for more use cases
- Read the [API documentation](./api.md)
- Check out individual package READMEs
