# Advanced Agent Patterns

[![npm version](https://img.shields.io/npm/v/advanced-agent-patterns.svg)](https://www.npmjs.com/package/advanced-agent-patterns)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Advanced agent patterns - ReAct, Plan-and-Execute, Self-Reflection

## 📦 Included Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **ReAct** | Reason + Act | Complex reasoning tasks |
| **Plan-and-Execute** | Plan first, then execute | Multi-step tasks |
| **Self-Reflection** | Critique and improve | Quality-critical tasks |
| **Tree of Thoughts** | Explore multiple paths | Creative problem solving |

## 🚀 Quick Start

```javascript
import { ReActAgent, PlanAndExecuteAgent, SelfReflectiveAgent } from '@agent-infra/patterns';

// ReAct Agent (Reason + Act)
const reactAgent = new ReActAgent({
  model: 'gpt-4',
  tools: ['search', 'calculator'],
  maxIterations: 10,
});

const result = await reactAgent.execute('What is the population of Tokyo?');
console.log(result.thoughts); // Shows reasoning process

// Plan and Execute
const planAgent = new PlanAndExecuteAgent({
  model: 'gpt-4',
});

const plan = await planAgent.plan('Write a research paper on AI');
console.log(plan.steps);

const result = await planAgent.execute(plan);

// Self-Reflective Agent
const reflectiveAgent = new SelfReflectiveAgent({
  model: 'gpt-4',
  reflectionRounds: 3,
});

const result = await reflectiveAgent.execute('Write a blog post');
console.log(result.improvements); // Shows how response was improved
```

## 📊 Pattern Comparison

| Pattern | Pros | Cons | Best For |
|---------|------|------|----------|
| ReAct | Transparent reasoning | More tokens | Complex QA |
| Plan-and-Execute | Structured approach | Rigid | Multi-step tasks |
| Self-Reflection | Higher quality | Slower | Critical content |

## 📝 License

MIT License
