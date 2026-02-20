# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-20

### Added

#### Core Agent Frameworks
- AgentBuilder for constructing autonomous agents
- AutonomousAgent execution engine
- ToolRegistry for managing agent tools
- MemoryManager for short and long-term memory

#### Agent Orchestration
- WorkflowEngine for DAG-based workflows
- TaskQueue for priority-based queuing
- AgentPool for managing agent instances

#### Memory & State Management
- VectorStore with multiple backend support
- AgentState for state persistence
- ConversationMemory for chat history

#### Evaluation & Testing
- Evaluator with predefined metrics
- TestSuite for test management
- Metrics: accuracy, relevance, faithfulness

#### Deployment & Serving
- ModelServer for LLM deployment
- DeploymentManager for multi-deployment
- LoadBalancer for traffic distribution

#### Multi-Agent Systems
- Agent class for individual agents
- AgentSociety for collaboration
- MessageBus for inter-agent communication
- CollaborationProtocol for interaction patterns

#### Tool Use & Integration
- ToolRegistry for tool management
- MCPClient for Model Context Protocol
- WorkflowConnector for Zapier/n8n
- BuiltinTools: search, calculator, file system, HTTP

### Documentation
- Comprehensive README with badges
- Package-specific documentation
- Contributing guidelines
- Code examples for all packages

### Infrastructure
- Monorepo structure with workspaces
- MIT License
- Git configuration
- npm package setup
