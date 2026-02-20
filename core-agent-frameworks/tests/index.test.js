/**
 * @jest-environment node
 */

/**
 * Core Agent Frameworks Tests
 */

import { AgentBuilder, ToolRegistry, MemoryManager } from '../src/index.js';

describe('AgentBuilder', () => {
  test('should create agent with default config', () => {
    const agent = new AgentBuilder().build();
    expect(agent).toBeDefined();
    expect(agent.config.model).toBe('gpt-4');
    expect(agent.config.temperature).toBe(0.7);
  });

  test('should create agent with custom model', () => {
    const agent = new AgentBuilder()
      .withModel('claude-3')
      .build();
    expect(agent.config.model).toBe('claude-3');
  });

  test('should create agent with custom temperature', () => {
    const agent = new AgentBuilder()
      .withTemperature(0.9)
      .build();
    expect(agent.config.temperature).toBe(0.9);
  });

  test('should add tools to agent', () => {
    const agent = new AgentBuilder()
      .withTools(['search', 'calculator'])
      .build();
    expect(agent.config.tools).toEqual(['search', 'calculator']);
  });

  test('should chain multiple configurations', () => {
    const agent = new AgentBuilder()
      .withModel('gpt-4-turbo')
      .withTemperature(0.5)
      .withTools(['search'])
      .withMaxIterations(5)
      .build();
    
    expect(agent.config.model).toBe('gpt-4-turbo');
    expect(agent.config.temperature).toBe(0.5);
    expect(agent.config.tools).toEqual(['search']);
    expect(agent.config.maxIterations).toBe(5);
  });
});

describe('ToolRegistry', () => {
  test('should create empty registry', () => {
    const registry = new ToolRegistry();
    expect(registry.list()).toEqual([]);
  });

  test('should register tool', () => {
    const registry = new ToolRegistry();
    const tool = { execute: async () => {} };
    
    registry.register('test-tool', tool);
    expect(registry.list()).toEqual(['test-tool']);
  });

  test('should get registered tool', () => {
    const registry = new ToolRegistry();
    const tool = { execute: async () => 'result' };
    
    registry.register('test-tool', tool);
    expect(registry.get('test-tool')).toBe(tool);
  });

  test('should return undefined for non-existent tool', () => {
    const registry = new ToolRegistry();
    expect(registry.get('non-existent')).toBeUndefined();
  });
});

describe('MemoryManager', () => {
  test('should create memory with default size', () => {
    const memory = new MemoryManager();
    expect(memory.maxSize).toBe(1000);
  });

  test('should create memory with custom size', () => {
    const memory = new MemoryManager({ maxSize: 100 });
    expect(memory.maxSize).toBe(100);
  });

  test('should add items to memory', () => {
    const memory = new MemoryManager();
    memory.add({ content: 'test' });
    expect(memory.get().length).toBe(1);
  });

  test('should respect max size limit', () => {
    const memory = new MemoryManager({ maxSize: 3 });
    
    memory.add({ content: '1' });
    memory.add({ content: '2' });
    memory.add({ content: '3' });
    memory.add({ content: '4' });
    
    expect(memory.get().length).toBe(3);
    expect(memory.get()[0].content).toBe('2');
  });

  test('should clear memory', () => {
    const memory = new MemoryManager();
    memory.add({ content: 'test' });
    memory.clear();
    expect(memory.get().length).toBe(0);
  });

  test('should search memory', () => {
    const memory = new MemoryManager();
    memory.add({ content: 'hello world' });
    memory.add({ content: 'foo bar' });
    
    const results = memory.search('hello');
    expect(results.length).toBe(1);
    expect(results[0].content).toBe('hello world');
  });
});

describe('AutonomousAgent', () => {
  test('should start in idle state', () => {
    const agent = new AgentBuilder().build();
    expect(agent.state).toBe('idle');
  });

  test('should execute task', async () => {
    const agent = new AgentBuilder().build();
    const result = await agent.execute('test task');
    
    expect(result.success).toBe(true);
    expect(agent.state).toBe('idle');
  });

  test('should track history', async () => {
    const agent = new AgentBuilder().build();
    
    await agent.execute('task 1');
    await agent.execute('task 2');
    
    expect(agent.history.length).toBe(2);
  });

  test('should emit events', async () => {
    const agent = new AgentBuilder().build();
    const events = [];
    
    agent.on('start', (data) => events.push({ type: 'start', data }));
    agent.on('complete', (data) => events.push({ type: 'complete', data }));
    
    await agent.execute('test');
    
    expect(events.length).toBe(2);
    expect(events[0].type).toBe('start');
    expect(events[1].type).toBe('complete');
  });

  test('should get state', () => {
    const agent = new AgentBuilder().build();
    const state = agent.getState();
    
    expect(state.state).toBe('idle');
    expect(state.config).toBeDefined();
  });
});
