# Multi-stage Docker build for Agent Infrastructure

# ===== NODE.JS STAGE =====
FROM node:20-alpine AS node-stage

WORKDIR /app

# Copy package files
COPY agent-infrastructure/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY agent-infrastructure/ .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start command
CMD ["node", "agent-cli/src/cli.js"]

# ===== PYTHON STAGE =====
FROM python:3.11-slim AS python-stage

WORKDIR /app

# Install dependencies
COPY python-agents/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY python-agents/ .

EXPOSE 8000

CMD ["python", "agent.py"]

# ===== GO STAGE =====
FROM golang:1.21-alpine AS go-stage

WORKDIR /app

COPY go-services/go.mod go-services/go.sum ./
RUN go mod download

COPY go-services/ .

EXPOSE 8080

CMD ["go", "run", "main.go"]

# ===== RUST STAGE =====
FROM rust:1.75-alpine AS rust-stage

WORKDIR /app

COPY rust-core/Cargo.toml rust-core/Cargo.lock ./
RUN mkdir src && echo "fn main(){}" > src/main.rs
RUN cargo build --release && rm -rf src

COPY rust-core/ .
RUN cargo build --release

EXPOSE 3030

CMD ["cargo", "run", "--release"]
