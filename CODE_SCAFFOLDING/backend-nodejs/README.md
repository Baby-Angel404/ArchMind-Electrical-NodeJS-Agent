# ArchMind Backend Microservice

## Overview
Production-grade NestJS / TypeScript backend microservice for industrial IoT and electrical telemetry ingestion.

## Architecture
- **MQTT Ingestion**: Resilient `mqtt.js` client handling TLS 1.3 encrypted connections on port 8883.
- **Data Persistence**:
  - PostgreSQL schema for device metadata and relational audit trails.
  - InfluxDB integration for high-frequency electrical telemetry time-series storage.
- **Real-Time Streaming**: WebSocket gateway broadcasting `telemetry:update` and `device:status` events to dashboards.
- **AI Agent API**: Structured analysis endpoint (`POST /api/agent/analyze`) for hardware risk evaluation and FMEA reasoning.

## Getting Started

```bash
# Install dependencies
npm install

# Run static type checking
npm run typecheck

# Run linter
npm run lint

# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Build production bundle
npm run build

# Start production server
npm run start:prod
```
