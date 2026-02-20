/**
 * LLM Providers
 * Unified interface for OpenAI, Anthropic, and local models
 */

import { EventEmitter } from 'events';

/**
 * Base LLM Provider - Abstract base class
 */
export class BaseLLMProvider extends EventEmitter {
  constructor(options = {}) {
    super();
    this.provider = 'base';
    this.model = options.model || 'default';
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.temperature = options.temperature ?? 0.7;
    this.maxTokens = options.maxTokens ?? 4096;
    this.topP = options.topP ?? 1;
    this.frequencyPenalty = options.frequencyPenalty ?? 0;
    this.presencePenalty = options.presencePenalty ?? 0;
    this.retryConfig = {
      maxRetries: options.maxRetries ?? 3,
      baseDelay: options.baseDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
    };
  }

  async chat(messages, options = {}) {
    throw new Error('Method not implemented');
  }

  async stream(messages, options = {}) {
    throw new Error('Method not implemented');
  }

  async embed(text) {
    throw new Error('Method not implemented');
  }

  async listModels() {
    throw new Error('Method not implemented');
  }

  async countTokens(text) {
    // Simple estimation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  estimateCost(tokens, model = this.model) {
    // Override in subclasses with actual pricing
    return { input: 0, output: 0, total: 0 };
  }

  async _withRetry(fn, context = 'API call') {
    let lastError;
    for (let i = 0; i < this.retryConfig.maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (error.status === 429 || error.message.includes('rate limit')) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, i),
            this.retryConfig.maxDelay
          );
          this.emit('rate-limit', { attempt: i + 1, delay });
          await new Promise(r => setTimeout(r, delay));
        } else if (error.status >= 500) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, i),
            this.retryConfig.maxDelay
          );
          this.emit('retry', { attempt: i + 1, error, delay });
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw error;
        }
      }
    }
    throw lastError;
  }
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider extends BaseLLMProvider {
  constructor(options = {}) {
    super(options);
    this.provider = 'openai';
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1';
    this.organization = options.organization;

    if (!this.apiKey) {
      console.warn('OpenAI API key not provided. Set OPENAI_API_KEY env var.');
    }
  }

  async chat(messages, options = {}) {
    const config = {
      model: options.model || this.model,
      messages: this._formatMessages(messages),
      temperature: options.temperature ?? this.temperature,
      max_tokens: options.maxTokens ?? this.maxTokens,
      top_p: options.topP ?? this.topP,
      frequency_penalty: options.frequencyPenalty ?? this.frequencyPenalty,
      presence_penalty: options.presencePenalty ?? this.presencePenalty,
      stream: false,
    };

    if (options.tools) {
      config.tools = options.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));
    }

    return this._withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.organization && { 'OpenAI-Organization': this.organization }),
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      this.emit('usage', data.usage);
      
      return {
        id: data.id,
        content: data.choices[0].message.content,
        role: data.choices[0].message.role,
        toolCalls: data.choices[0].message.tool_calls,
        finishReason: data.choices[0].finish_reason,
        usage: data.usage,
        model: data.model,
      };
    });
  }

  async *stream(messages, options = {}) {
    const config = {
      model: options.model || this.model,
      messages: this._formatMessages(messages),
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
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
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
            if (chunk) {
              yield chunk;
              this.emit('chunk', chunk);
            }
          } catch (e) {
            // Skip invalid JSON
          }
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
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async listModels() {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list models');
    }

    const data = await response.json();
    return data.data.map(m => ({ id: m.id, ownedBy: m.owned_by }));
  }

  estimateCost(tokens, model = this.model) {
    const pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4-32k': { input: 0.06, output: 0.12 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };

    const rates = pricing[model] || pricing['gpt-3.5-turbo'];
    const inputCost = (tokens.input || 0) * rates.input / 1000;
    const outputCost = (tokens.output || 0) * rates.output / 1000;

    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost,
    };
  }

  _formatMessages(messages) {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.name && { name: m.name }),
    }));
  }
}

/**
 * Anthropic Provider
 */
export class AnthropicProvider extends BaseLLMProvider {
  constructor(options = {}) {
    super(options);
    this.provider = 'anthropic';
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.anthropic.com';
    this.apiVersion = options.apiVersion || '2023-06-01';

    if (!this.apiKey) {
      console.warn('Anthropic API key not provided. Set ANTHROPIC_API_KEY env var.');
    }
  }

  async chat(messages, options = {}) {
    const systemMessages = messages.filter(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const config = {
      model: options.model || this.model,
      messages: this._formatMessages(userMessages),
      max_tokens: options.maxTokens ?? this.maxTokens,
      temperature: options.temperature ?? this.temperature,
      top_p: options.topP ?? this.topP,
    };

    if (systemMessages.length > 0) {
      config.system = systemMessages[0].content;
    }

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
    const systemMessages = messages.filter(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const config = {
      model: options.model || this.model,
      messages: this._formatMessages(userMessages),
      max_tokens: options.maxTokens ?? this.maxTokens,
      temperature: options.temperature ?? this.temperature,
      stream: true,
    };

    if (systemMessages.length > 0) {
      config.system = systemMessages[0].content;
    }

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

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'content_block_delta') {
              const chunk = event.delta?.text || '';
              if (chunk) {
                yield chunk;
                this.emit('chunk', chunk);
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async listModels() {
    // Anthropic doesn't have a models endpoint, return known models
    return [
      { id: 'claude-3-opus-20240229', type: 'claude' },
      { id: 'claude-3-sonnet-20240229', type: 'claude' },
      { id: 'claude-3-haiku-20240307', type: 'claude' },
      { id: 'claude-2.1', type: 'claude' },
    ];
  }

  estimateCost(tokens, model = this.model) {
    const pricing = {
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'claude-2.1': { input: 0.008, output: 0.024 },
    };

    const modelKey = Object.keys(pricing).find(k => model.includes(k)) || 'claude-2.1';
    const rates = pricing[modelKey];
    const inputCost = (tokens.input || 0) * rates.input / 1000;
    const outputCost = (tokens.output || 0) * rates.output / 1000;

    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost,
    };
  }

  _formatMessages(messages) {
    return messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));
  }
}

/**
 * Ollama Provider (Local Models)
 */
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
      messages: this._formatMessages(messages),
      stream: false,
      options: {
        temperature: options.temperature ?? this.temperature,
        num_predict: options.maxTokens ?? this.maxTokens,
        top_p: options.topP ?? this.topP,
      },
    };

    return this._withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Ollama API error');
      }

      const data = await response.json();
      
      return {
        content: data.message?.content || '',
        role: 'assistant',
        model: data.model,
        done: data.done,
      };
    });
  }

  async *stream(messages, options = {}) {
    const config = {
      model: options.model || this.model,
      messages: this._formatMessages(messages),
      stream: true,
      options: {
        temperature: options.temperature ?? this.temperature,
        num_predict: options.maxTokens ?? this.maxTokens,
      },
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Ollama API error');
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
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            const chunk = data.message?.content || '';
            if (chunk) {
              yield chunk;
              this.emit('chunk', chunk);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async listModels() {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.models?.map(m => ({
      id: m.name,
      size: m.size,
      digest: m.digest,
    })) || [];
  }

  _formatMessages(messages) {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }
}

/**
 * Create LLM Provider from config
 */
export function createProvider(options = {}) {
  const provider = options.provider?.toLowerCase() || 'openai';

  switch (provider) {
    case 'openai':
      return new OpenAIProvider(options);
    case 'anthropic':
      return new AnthropicProvider(options);
    case 'ollama':
      return new OllamaProvider(options);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Multi-Provider Router - Try multiple providers
 */
export class MultiProvider extends EventEmitter {
  constructor(providers) {
    super();
    this.providers = providers;
    this.currentIndex = 0;
  }

  async chat(messages, options = {}) {
    let lastError;
    
    for (const provider of this.providers) {
      try {
        this.emit('trying', { provider: provider.provider });
        const result = await provider.chat(messages, options);
        this.emit('success', { provider: provider.provider });
        return result;
      } catch (error) {
        lastError = error;
        this.emit('failed', { provider: provider.provider, error: error.message });
      }
    }

    throw lastError;
  }

  async *stream(messages, options = {}) {
    const provider = this.providers[this.currentIndex];
    yield* provider.stream(messages, options);
  }
}

export default {
  BaseLLMProvider,
  OpenAIProvider,
  AnthropicProvider,
  OllamaProvider,
  createProvider,
  MultiProvider,
};
