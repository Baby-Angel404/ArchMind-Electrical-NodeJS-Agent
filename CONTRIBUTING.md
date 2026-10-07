# Contributing to ArchMind-Electrical-NodeJS-Agent

Thank you for your interest in contributing to **ArchMind**! As a mission-critical cyber-physical engineering repository, we follow strict verification standards before accepting pull requests.

## Engineering Workflow
All contributions must adhere to the engineering lifecycle:
```text
PLAN → ARCHITECTURE → IMPLEMENTATION → STATIC ANALYSIS → TESTS → VERIFICATION → PR
```

## Ground Rules
1. **Never Commit Secrets**: Do not commit API keys, `.env` files, broker credentials, or private keys.
2. **Deterministic Schemas**: Never alter the `TelemetryMessage` contract without coordinating changes across firmware, backend, and frontend schemas simultaneously.
3. **Safety First**: Any modifications to electrical calculation logic must include mathematical proofs or datasheet citations.

## Local Development & Validation
Before submitting your pull request, run the following validation suite locally:

```bash
# 1. Backend validation
cd CODE_SCAFFOLDING/backend-nodejs
npm install
npm run lint
npm run typecheck
npm test
npm run build

# 2. Frontend validation
cd ../frontend
npm install
npm run lint
npm run build

# 3. Firmware syntax & logic check
cd ../firmware
# Run PlatformIO or the test runner:
g++ -std=c++17 test/test_telemetry.cpp -Iinclude -o test_runner && ./test_runner
```

## Pull Request Guidelines
- Follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Include comprehensive unit and integration tests for every new feature.
- Ensure all CI/CD workflows pass.
