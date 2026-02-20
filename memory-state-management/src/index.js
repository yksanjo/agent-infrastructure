/**
 * Memory & State Management
 * Vector store and state management for AI agents
 */

/**
 * Vector Store - Unified interface for vector databases
 */
export class VectorStore {
  constructor(options = {}) {
    this.provider = options.provider || 'memory';
    this.collection = options.collection || 'default';
    this.store = new Map();
  }

  async add(document) {
    const { id, content, metadata, embedding } = document;
    this.store.set(id, {
      id,
      content,
      metadata: metadata || {},
      embedding: embedding || null,
      createdAt: Date.now(),
    });
    return id;
  }

  async get(id) {
    return this.store.get(id);
  }

  async delete(id) {
    return this.store.delete(id);
  }

  async similaritySearch(query, options = {}) {
    const limit = options.limit || 10;
    // Placeholder - integrate with actual vector search
    const results = Array.from(this.store.values())
      .filter(item => 
        item.content.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);
    
    return {
      matches: results,
      query,
      limit,
    };
  }

  async upsert(document) {
    return this.add(document);
  }

  async count() {
    return this.store.size;
  }

  async clear() {
    this.store.clear();
  }
}

/**
 * Agent State - Manage agent state and persistence
 */
export class AgentState {
  constructor(options = {}) {
    this.storage = options.storage || 'memory';
    this.state = new Map();
  }

  async set(key, value) {
    this.state.set(key, {
      value,
      updatedAt: Date.now(),
    });
  }

  async get(key, defaultValue = null) {
    const item = this.state.get(key);
    return item ? item.value : defaultValue;
  }

  async delete(key) {
    return this.state.delete(key);
  }

  async keys() {
    return Array.from(this.state.keys());
  }

  async clear() {
    this.state.clear();
  }

  async snapshot() {
    return {
      timestamp: Date.now(),
      state: Object.fromEntries(
        Array.from(this.state.entries()).map(([k, v]) => [k, v.value])
      ),
    };
  }

  async restore(snapshot) {
    this.state.clear();
    Object.entries(snapshot.state).forEach(([k, v]) => {
      this.state.set(k, { value: v, updatedAt: snapshot.timestamp });
    });
  }
}

/**
 * Conversation Memory - Store and retrieve conversation history
 */
export class ConversationMemory {
  constructor(options = {}) {
    this.maxMessages = options.maxMessages || 100;
    this.messages = [];
  }

  add(message) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
    
    return msg;
  }

  get(limit = 10) {
    return this.messages.slice(-limit);
  }

  getByRole(role, limit = 10) {
    return this.messages
      .filter(m => m.role === role)
      .slice(-limit);
  }

  clear() {
    this.messages = [];
  }

  getSummary() {
    return {
      totalMessages: this.messages.length,
      firstMessage: this.messages[0],
      lastMessage: this.messages[this.messages.length - 1],
    };
  }
}

export default {
  VectorStore,
  AgentState,
  ConversationMemory,
};
