# LLM Providers

[![npm version](https://img.shields.io/npm/v/llm-providers.svg)](https://www.npmjs.com/package/llm-providers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenAI](https://img.shields.io/badge/OpenAI-supported-brightgreen)](https://openai.com)
[![Anthropic](https://img.shields.io/badge/Anthropic-supported-brightgreen)](https://anthropic.com)
[![Local Models](https://img.shields.io/badge/Local%20Models-supported-brightgreen)](https://ollama.ai)

> Unified interface for LLM providers - OpenAI, Anthropic, and local models

## 📦 Supported Providers

| Provider | Models | Status |
|----------|--------|--------|
| **OpenAI** | GPT-4, GPT-4 Turbo, GPT-3.5 Turbo | ✅ Supported |
| **Anthropic** | Claude 3 Opus, Sonnet, Haiku | ✅ Supported |
| **Ollama** | Llama 2, Mistral, Mixtral | ✅ Supported |
| **Local API** | Any OpenAI-compatible API | ✅ Supported |

## 🚀 Quick Start

```javascript
import { LLMProvider, createProvider } from '@agent-infra/llm-providers';

// Create provider (auto-detects from env)
const llm = createProvider({
  provider: 'openai', // or 'anthropic', 'ollama'
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});

// Chat completion
const response = await llm.chat([
  { role: 'user', content: 'Hello, how are you?' }
]);
console.log(response.content);

// Streaming
const stream = llm.stream([
  { role: 'user', content: 'Write a story' }
]);
for await (const chunk of stream) {
  process.stdout.write(chunk);
}

// Generate embeddings
const embedding = await llm.embed('Hello world');
```

## 📊 Features

- ✅ Unified interface across providers
- ✅ Chat completions with function calling
- ✅ Streaming responses
- ✅ Token counting and cost estimation
- ✅ Automatic retries with exponential backoff
- ✅ Rate limiting handling
- ✅ Embedding generation
- ✅ Model listing and capabilities

## 🔧 Configuration

```javascript
// OpenAI
const openai = new OpenAIProvider({
  apiKey: 'sk-...',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 4096,
});

// Anthropic
const anthropic = new AnthropicProvider({
  apiKey: 'sk-ant-...',
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
  maxTokens: 4096,
});

// Ollama (Local)
const ollama = new OllamaProvider({
  baseUrl: 'http://localhost:11434',
  model: 'llama2',
  temperature: 0.7,
});
```

## 📝 License

MIT License
