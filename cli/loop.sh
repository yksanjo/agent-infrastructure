#!/bin/bash

# Agent Infrastructure - Continuous Loop Runner
# Usage: ./loop.sh [options]
#
# Options:
#   -b, --batch-size <n>    Number of repos per iteration (default: 100)
#   -d, --delay <ms>        Delay between iterations in ms (default: 5000)
#   -m, --max-iterations <n> Max iterations, 0 for infinite (default: 0)
#   --dry-run               Dry run mode (no actual GitHub creation)
#   -i, --interactive       Interactive mode
#   -h, --help              Show this help

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI="$SCRIPT_DIR/src/cli.js"

# Default values
BATCH_SIZE=100
DELAY=5000
MAX_ITERATIONS=0
DRY_RUN="--dry-run"
INTERACTIVE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--batch-size)
      BATCH_SIZE="$2"
      shift 2
      ;;
    -d|--delay)
      DELAY="$2"
      shift 2
      ;;
    -m|--max-iterations)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="--dry-run"
      shift
      ;;
    --live)
      DRY_RUN=""
      shift
      ;;
    -i|--interactive)
      INTERACTIVE="--interactive"
      shift
      ;;
    -h|--help)
      head -15 "$0" | tail -13
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h for help"
      exit 1
      ;;
  esac
done

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   AGENTIC INFRASTRUCTURE - CONTINUOUS LOOP               ║"
echo "║   Plan → Build → Push (Forever)                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Run the loop
cd "$SCRIPT_DIR"
node "$CLI" loop \
  --batch-size "$BATCH_SIZE" \
  --delay "$DELAY" \
  --max-iterations "$MAX_ITERATIONS" \
  $DRY_RUN \
  $INTERACTIVE
