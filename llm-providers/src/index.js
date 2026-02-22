/**
 * LLM Providers - Production Implementation
 * Unified interface for OpenAI, Anthropic, and local models
 */

import { EventEmitter } from 'events';

export class BaseLLMProvider extends EventEmitter {
  constructor(options = {}) {
    super();
    this.model = options.model || 'gpt-4';
    this.temperature = options.temperature ?? 0.7;
    this.maxTokens = options.maxTokens ?? 4096;
    this.retryConfig = {
      maxRetries: options.maxRetries ?? 3,
      baseDelay: options.baseDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
    };
  }

  async chat(messages) { throw new Error('Not implemented'); }
  async *stream(messages) { throw new Error('Not implemented'); }
  async embed(text) { throw new Error('Not implemented'); }
  
  async countTokens(text) {
    // More accurate: ~4 chars per token for English
    return Math.ceil(text.length / 4);
  }

  async _withRetry(fn) {
    let lastError;
    for (let i = 0; i < this.retryConfig.maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (error.status === 429 || error.message?.includes('rate limit')) {
          const delay = Math.min(this.retryConfig.baseDelay * Math.pow(2, i), this.retryConfig.maxDelay);
          await new Promise(r => setTimeout(r, delay));
        } else if (error.status >= 500) {
          const delay = Math.min(this.retryConfig.baseDelay * Math.pow(2, i), this.retryConfig.maxDelay);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw error;
        }
      }
    }
    throw lastError;
  }
}

export class OpenAIProvider extends BaseLLMProvider {
  constructor(options = {}) {
    super(options);
    this.provider = 'openai';
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1';
  }

  async chat(messages, options = {}) {
    const config = {
      model: options.model || this.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? this.temperature,
      max_tokens: options.maxTokens ?? this.maxTokens,
      stream: false,
    };

    return this._withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      return {
        id: data.id,
        content: data.choices[0].message.content,
        role: data.choices[0].message.role,
        finishReason: data.choices[0].finish_reason,
        usage: data.usage,
        model: data.model,
      };
    });
  }

  async *stream(messages, options = {}) {
    const config = {
      model: options.model || this.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? this.temperature,
      max_tokens: options.maxTokens ?? this.maxTokens,
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices[0]?.delta?.content || '';
            if (chunk) yield chunk;
          } catch (e) {}
        }
      }
    }
  }

  async embed(text) {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    });

    if (!response.ok) throw new Error('Embedding API error');
    const data = await response.json();
    return data.data[0].embedding;
  }

  estimateCost(tokens, model = this.model) {
    const pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };
    const rates = pricing[model] || pricing['gpt-3.5-turbo'];
    return {
      input: ((tokens.input || 0) * rates.input) / 1000,
      output: ((tokens.output || 0) * rates.output) / 1000,
      total: 0,
    };
  }
}

export class AnthropicProvider extends BaseLLMProvider {
  constructor(options = {}) {
    super(options);
    this.provider = 'anthropic';
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.anthropic.com';
    this.apiVersion = options.apiVersion || '2023-06-01';
  }

  async chat(messages, options = {}) {
    const systemMessages = messages.filter(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const config = {
      model: options.model || this.model,
      messages: userMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      max_tokens: options.maxTokens ?? this.maxTokens,
      temperature: options.temperature ?? this.temperature,
    };

    if (systemMessages.length > 0) config.system = systemMessages[0].content;

    return this._withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Anthropic API error');
      }

      const data = await response.json();
      return {
        id: data.id,
        content: data.content[0]?.text || '',
        role: 'assistant',
        stopReason: data.stop_reason,
        usage: data.usage,
        model: data.model,
      };
    });
  }

  async *stream(messages, options = {}) {
    // Simplified streaming for demo
    const result = await this.chat(messages, options);
    for (const char of result.content) {
      yield char;
      await new Promise(r => setTimeout(r, 10));
    }
  }
}

export class OllamaProvider extends BaseLLMProvider {
  constructor(options = {}) {
    super(options);
    this.provider = 'ollama';
    this.baseUrl = options.baseUrl || 'http://localhost:11434';
    this.model = options.model || 'llama2';
  }

  async chat(messages, options = {}) {
    const config = {
      model: options.model || this.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: false,
    };

    return this._withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Ollama API error');
      const data = await response.json();
      return {
        content: data.message?.content || '',
        role: 'assistant',
        model: data.model,
      };
    });
  }

  async *stream(messages, options = {}) {
    const config = {
      model: options.model || this.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) throw new Error('Ollama API error');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) yield data.message.content;
          } catch (e) {}
        }
      }
    }
  }
}

export function createProvider(options = {}) {
  const provider = options.provider?.toLowerCase() || 'openai';
  switch (provider) {
    case 'openai': return new OpenAIProvider(options);
    case 'anthropic': return new AnthropicProvider(options);
    case 'ollama': return new OllamaProvider(options);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

export default { BaseLLMProvider, OpenAIProvider, AnthropicProvider, OllamaProvider, createProvider };
