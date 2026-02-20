/**
 * @jest-environment node
 */

/**
 * LLM Providers Tests
 */

import { OpenAIProvider, AnthropicProvider, OllamaProvider, createProvider, MultiProvider } from '../src/index.js';

describe('OpenAIProvider', () => {
  test('should create provider with default config', () => {
    const provider = new OpenAIProvider();
    expect(provider.provider).toBe('openai');
    expect(provider.model).toBe('default');
  });

  test('should create provider with custom config', () => {
    const provider = new OpenAIProvider({
      model: 'gpt-4-turbo',
      temperature: 0.5,
      maxTokens: 2048,
    });
    expect(provider.model).toBe('gpt-4-turbo');
    expect(provider.temperature).toBe(0.5);
    expect(provider.maxTokens).toBe(2048);
  });

  test('should estimate cost for gpt-4', () => {
    const provider = new OpenAIProvider();
    const cost = provider.estimateCost({ input: 1000, output: 500 }, 'gpt-4');
    
    expect(cost.input).toBe(0.03);
    expect(cost.output).toBe(0.03);
    expect(cost.total).toBe(0.06);
  });

  test('should count tokens', async () => {
    const provider = new OpenAIProvider();
    const tokens = await provider.countTokens('Hello world!');
    expect(tokens).toBe(3);
  });
});

describe('AnthropicProvider', () => {
  test('should create provider with default config', () => {
    const provider = new AnthropicProvider();
    expect(provider.provider).toBe('anthropic');
  });

  test('should estimate cost for claude-3-opus', () => {
    const provider = new AnthropicProvider();
    const cost = provider.estimateCost({ input: 1000, output: 500 }, 'claude-3-opus-20240229');
    
    expect(cost.input).toBe(0.015);
    expect(cost.output).toBe(0.0375);
    expect(cost.total).toBeCloseTo(0.0525, 4);
  });

  test('should list available models', async () => {
    const provider = new AnthropicProvider();
    const models = await provider.listModels();
    
    expect(models.length).toBeGreaterThan(0);
    expect(models[0].id).toContain('claude');
  });
});

describe('OllamaProvider', () => {
  test('should create provider with local url', () => {
    const provider = new OllamaProvider({
      baseUrl: 'http://localhost:11434',
      model: 'llama2',
    });
    expect(provider.baseUrl).toBe('http://localhost:11434');
    expect(provider.model).toBe('llama2');
  });
});

describe('createProvider', () => {
  test('should create OpenAI provider', () => {
    const provider = createProvider({ provider: 'openai' });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  test('should create Anthropic provider', () => {
    const provider = createProvider({ provider: 'anthropic' });
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  test('should create Ollama provider', () => {
    const provider = createProvider({ provider: 'ollama' });
    expect(provider).toBeInstanceOf(OllamaProvider);
  });

  test('should default to OpenAI', () => {
    const provider = createProvider();
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  test('should throw for unknown provider', () => {
    expect(() => createProvider({ provider: 'unknown' })).toThrow();
  });
});

describe('MultiProvider', () => {
  test('should try providers in order', async () => {
    const mockProvider1 = {
      provider: 'openai',
      chat: jest.fn().mockRejectedValue(new Error('Failed')),
    };
    const mockProvider2 = {
      provider: 'anthropic',
      chat: jest.fn().mockResolvedValue({ content: 'success' }),
    };

    const multi = new MultiProvider([mockProvider1, mockProvider2]);
    const result = await multi.chat([{ role: 'user', content: 'test' }]);

    expect(mockProvider1.chat).toHaveBeenCalled();
    expect(mockProvider2.chat).toHaveBeenCalled();
    expect(result.content).toBe('success');
  });
});
