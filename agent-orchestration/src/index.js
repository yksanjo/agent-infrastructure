/**
 * Agent Orchestration
 * Workflow orchestration for multi-agent systems
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

/**
 * Workflow Engine - Orchestrate complex agent workflows
 */
export class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
    this.dependencies = new Map();
    this.results = new Map();
    this.state = 'idle';
  }

  addTask(name, fn) {
    this.tasks.set(name, { fn, status: 'pending' });
    this.dependencies.set(name, []);
    return this;
  }

  dependsOn(task, dependencies) {
    this.dependencies.set(task, dependencies);
    return this;
  }

  async execute(context = {}) {
    this.state = 'running';
    this.emit('start', { context });

    const completed = new Set();
    const inProgress = new Set();

    const canRun = (task) => {
      const deps = this.dependencies.get(task);
      return deps.every(dep => completed.has(dep));
    };

    const runTask = async (name) => {
      const task = this.tasks.get(name);
      if (!task || task.status !== 'pending') return;

      task.status = 'running';
      inProgress.add(name);
      this.emit('task:start', { task: name });

      try {
        const deps = this.dependencies.get(name);
        const inputs = deps.map(dep => this.results.get(dep));
        const result = await task.fn(...inputs, context);
        this.results.set(name, result);
        task.status = 'completed';
        completed.add(name);
        this.emit('task:complete', { task: name, result });
      } catch (error) {
        task.status = 'failed';
        this.emit('task:error', { task: name, error });
        throw error;
      } finally {
        inProgress.delete(name);
      }
    };

    try {
      while (completed.size + inProgress.size < this.tasks.size) {
        const runnable = Array.from(this.tasks.keys())
          .filter(task => 
            !completed.has(task) && 
            !inProgress.has(task) && 
            canRun(task)
          );

        await Promise.all(runnable.map(runTask));
      }

      this.state = 'completed';
      this.emit('complete', { results: Object.fromEntries(this.results) });
      return Object.fromEntries(this.results);
    } catch (error) {
      this.state = 'failed';
      this.emit('error', { error });
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      tasks: Object.fromEntries(
        Array.from(this.tasks.entries()).map(([k, v]) => [k, v.status])
      ),
    };
  }
}

/**
 * Task Queue - Priority-based task queuing
 */
export class TaskQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(task, priority = 0) {
    this.queue.push({ task, priority, id: uuidv4() });
    this.queue.sort((a, b) => b.priority - a.priority);
    return this;
  }

  dequeue() {
    return this.queue.shift();
  }

  peek() {
    return this.queue[0];
  }

  size() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * Agent Pool - Manage pool of agent instances
 */
export class AgentPool {
  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.agents = [];
    this.inUse = new Set();
  }

  async acquire() {
    if (this.agents.length === 0 && this.inUse.size < this.maxSize) {
      const agent = await this._createAgent();
      this.agents.push(agent);
    }

    while (this.agents.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const agent = this.agents.pop();
    this.inUse.add(agent);
    return agent;
  }

  async release(agent) {
    this.inUse.delete(agent);
    this.agents.push(agent);
  }

  async _createAgent() {
    // Placeholder - create actual agent instances
    return { id: uuidv4(), createdAt: Date.now() };
  }

  stats() {
    return {
      total: this.agents.length + this.inUse.size,
      available: this.agents.length,
      inUse: this.inUse.size,
    };
  }
}

export default {
  WorkflowEngine,
  TaskQueue,
  AgentPool,
};
