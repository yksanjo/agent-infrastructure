/**
 * TypeScript Type Definitions for Agent Infrastructure
 * Shared types across all languages
 */

// =============== CORE TYPES ===============

export interface AgentRequest {
  task: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentResponse {
  result: string;
  thoughts: Thought[];
  duration: number;
  model?: string;
}

export interface Thought {
  type: 'thought' | 'action' | 'observation' | 'answer';
  content: string;
  iteration?: number;
}

// =============== LLM TYPES ===============

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama';
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface EmbeddingRequest {
  model?: string;
  input: string | string[];
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
}

// =============== VECTOR STORE TYPES ===============

export interface VectorDocument {
  id?: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface SearchOptions {
  limit?: number;
  filter?: Record<string, unknown>;
  includeEmbeddings?: boolean;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

export interface SearchResponse {
  matches: SearchResult[];
  query: string | number[];
  limit: number;
}

// =============== AGENT PATTERN TYPES ===============

export interface PlanStep {
  id: number;
  description: string;
  type: 'research' | 'analysis' | 'synthesis' | 'execution';
  status?: 'pending' | 'completed' | 'failed';
  result?: string;
}

export interface Plan {
  task: string;
  steps: PlanStep[];
  createdAt: number;
}

export interface Reflection {
  round: number;
  critique: Critique;
  responseBefore: string;
  responseAfter?: string;
}

export interface Critique {
  scores: Record<string, number>;
  score: number;
  strengths: string[];
  suggestions: string[];
}

export interface TreeNode {
  id: string;
  thought: string;
  depth: number;
  value: number;
  children: TreeNode[];
}

// =============== EVENT TYPES ===============

export interface AgentEvent {
  type: string;
  timestamp: number;
  data: unknown;
}

export type AgentEventType = 
  | 'start'
  | 'iteration' 
  | 'step-start' 
  | 'step-complete'
  | 'step-failed'
  | 'reflection'
  | 'critique'
  | 'complete'
  | 'error';

// =============== CONFIG TYPES ===============

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface AgentTools {
  name: string;
  description?: string;
  execute: (input: unknown) => Promise<string>;
}

// ============== UTILITY TYPES ===============

export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export type AsyncResult<T> = Promise<Result<T>>;

// ============== FACTORY TYPES ===============

export interface ProviderFactory {
  create(config: LLMConfig): unknown;
}

// Export all types
export type {
  // Re-export with different names for clarity
  AgentRequest as Request,
  AgentResponse as Response,
  LLMConfig as Config,
};
