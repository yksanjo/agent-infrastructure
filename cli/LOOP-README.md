# AI Infrastructure Project Loop

**Plan → Build → Push** loop that creates **10 MVP AI infrastructure projects** and pushes them to `github.com/yksanjo`.

## Quick Start

### Test Run (Dry-run)

```bash
cd ~/
./start-loop.sh --dry-run
```

### Live Run (Creates actual repos)

```bash
./start-loop.sh --live
```

Or if you're authenticated with GitHub, just run:

```bash
./start-loop.sh
```

## 10 MVP Projects

The loop creates these 10 AI infrastructure projects:

| # | Project | Language | Description |
|---|---------|----------|-------------|
| 1 | agent-waf | TypeScript | Web Application Firewall for AI Agents |
| 2 | agent-observability | Go | Monitoring & Tracing Platform |
| 3 | agent-gateway | Rust | API Gateway for Agent Communication |
| 4 | agent-memory-store | Python | Distributed Memory Store |
| 5 | agent-orchestrator | TypeScript | Multi-Agent Workflow Engine |
| 6 | agent-registry | Go | Service Registry & Discovery |
| 7 | agent-policy-engine | Rust | Policy Enforcement Engine |
| 8 | agent-cache | Python | Intelligent Response Cache |
| 9 | agent-queue | TypeScript | Message Queue System |
| 10 | agent-config | Go | Configuration Management |

## How It Works

### Each Iteration

```
┌─────────────┐
│   PLAN      │  Select next MVP project from list
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   BUILD     │  Create complete project structure:
│             │  - Package config (package.json, go.mod, etc)
│             │  - Source directories
│             │  - Main source files
│             │  - Tests
│             │  - README.md
│             │  - .gitignore
│             │  - LICENSE (MIT)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   PUSH      │  Deploy to GitHub:
│             │  - git init
│             │  - git add & commit
│             │  - gh repo create --push
│             │  - Target: github.com/yksanjo
└──────┬──────┘
       │
       ▼
   Next Iteration (10 total)
```

## Usage

### From Home Directory

```bash
# Test (dry-run)
./start-loop.sh --dry-run

# Live (creates repos)
./start-loop.sh --live

# Help
./start-loop.sh --help
```

### From CLI Directory

```bash
cd agent-infrastructure/cli

# Dry-run
npm run start -- loop --dry-run

# Live
npm run start -- loop
```

## Prerequisites

### Required

1. **Node.js** v18+
2. **GitHub CLI** (`gh`)
3. **Git** configured

### Setup

```bash
# Install GitHub CLI (macOS)
brew install gh

# Authenticate
gh auth login

# Verify
gh auth status
```

## Output

### Repositories Created

All projects are created in your home directory:

```
~/
├── agent-infra-agent-waf/
├── agent-infra-agent-observability/
├── agent-infra-agent-gateway/
├── agent-infra-agent-memory-store/
├── agent-infra-agent-orchestrator/
├── agent-infra-agent-registry/
├── agent-infra-agent-policy-engine/
├── agent-infra-agent-cache/
├── agent-infra-agent-queue/
└── agent-infra-agent-config/
```

And pushed to:

```
https://github.com/yksanjo/agent-infra-agent-waf
https://github.com/yksanjo/agent-infra-agent-observability
https://github.com/yksanjo/agent-infra-agent-gateway
...
```

### Logs

**JSON Log**: `~/agent-infra-loop-log.json`
**Text Log**: `~/agent-infra-loop.log`

## Example Output

```
████████████████████████████████████████████████████████████
█  AI INFRASTRUCTURE PROJECT LOOP                          █
█  Plan → Build → Push (10 MVP Projects)                   █
█  Target: github.com/yksanjo                              █
████████████████████████████████████████████████████████████

MVP Projects to Create:
  1. agent-infra-agent-waf (typescript) - Web
  2. agent-infra-agent-observability (go) - Observability
  ...

────────────────────────────────────────────────────────────
ITERATION 1/10
────────────────────────────────────────────────────────────

📋 Planning MVP project...
✔ ✓ Planned: agent-infra-agent-waf

🔨 Build Phase:
✔ ✓ Built agent-infra-agent-waf

🚀 Push Phase:
✔ ✓ Pushed to https://github.com/yksanjo/agent-infra-agent-waf

📊 Iteration Summary:
  Project:  agent-infra-agent-waf
  Language: typescript
  Status:   ✓ SUCCESS
  URL:      https://github.com/yksanjo/agent-infra-agent-waf
  Duration: 2341ms

============================================================
  AI INFRASTRUCTURE PROJECT LOOP
============================================================
  Total Iterations:    1/10
  Projects Created:    1
  Elapsed Time:        0h 0m 2s
  GitHub Org:          yksanjo
============================================================

[continues for all 10 projects...]
```

## Project Structure

Each created project includes:

```
agent-infra-{name}/
├── src/                    # Source code
│   ├── index.ts/.go/.py/.rs
│   └── lib/
├── tests/                  # Test files
├── package.json / go.mod / Cargo.toml
├── tsconfig.json (TypeScript)
├── README.md              # Complete documentation
├── .gitignore
└── LICENSE                # MIT License
```

## Stopping the Loop

Press `Ctrl+C` to stop gracefully. Progress is saved to logs.

## Troubleshooting

### "gh: command not found"

```bash
brew install gh
```

### "Not authenticated"

```bash
gh auth login
```

### Git authentication failed

```bash
gh auth status
gh auth login
```

## What's Created in Each Project

### TypeScript Projects

- `package.json` with scripts
- `tsconfig.json`
- `src/index.ts` with main class
- `tests/index.test.ts`
- Full README with API docs

### Go Projects

- `go.mod`
- `cmd/main.go`
- `internal/{name}/{name}.go`
- Tests
- Complete README

### Python Projects

- `pyproject.toml`
- `src/{package}/__init__.py`
- `tests/test_init.py`
- README with examples

### Rust Projects

- `Cargo.toml`
- `src/lib.rs`
- `src/main.rs`
- Tests
- Documentation

## License

MIT - Yoshi Kondo

## Part of Agent Infrastructure

This loop is part of the [Agent Infrastructure](https://github.com/yksanjo/agent-infrastructure) project.
