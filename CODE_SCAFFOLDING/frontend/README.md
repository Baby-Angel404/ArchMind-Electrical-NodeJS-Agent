# ArchMind Next.js Frontend Dashboard

## Overview
Next.js 14 App Router telemetry visualization dashboard built with TypeScript and Tailwind CSS.

## Features
- **Real-Time Streaming**: Directly consumes WebSocket telemetry (`telemetry:update`) without polling.
- **Metric Gauges**: Real-time RMS voltage, current, active power, and junction temperatures.
- **Sparkline Waveforms**: Responsive SVG line charts showing live electrical trends.
- **AI Agent Integration**: Interactive panel triggering architectural FMEA assessments (`POST /api/agent/analyze`).

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linter
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```
