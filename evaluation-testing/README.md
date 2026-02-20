# Evaluation & Testing

[![npm version](https://img.shields.io/npm/v/evaluation-testing.svg)](https://www.npmjs.com/package/evaluation-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Evaluation and testing frameworks for LLM applications

## 📦 Included Frameworks

- **Ragas** - RAG evaluation framework
- **Arize Phoenix** - LLM observability and evaluation
- **LangSmith** - Debugging and monitoring (LangChain)
- **DeepEval** - LLM testing framework

## 🚀 Quick Start

```javascript
import { Evaluator, Metrics, TestSuite } from '@agent-infra/evaluation';

// Create test suite
const suite = new TestSuite('Agent Evaluation');

// Add test cases
suite.addCase({
  name: 'Basic Q&A',
  input: 'What is TypeScript?',
  expected: 'TypeScript is a typed superset of JavaScript',
});

// Run evaluation
const results = await suite.run({
  metrics: ['accuracy', 'relevance', 'faithfulness']
});

console.log(results.summary);
```

## 📊 Metrics

| Metric | Description | Range |
|--------|-------------|-------|
| Accuracy | Correctness of response | 0-1 |
| Relevance | How relevant is the answer | 0-1 |
| Faithfulness | Factual consistency | 0-1 |
| Context Precision | Quality of retrieved context | 0-1 |
| Answer Relevance | Relevance to question | 0-1 |

## 📝 License

MIT License
