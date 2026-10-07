# Changelog

All notable changes to the `ArchMind-Electrical-NodeJS-Agent` project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-08

### Added
- **Core Architecture**: Cyber-physical engineering specification covering physical hardware, ESP32 firmware, MQTT broker, NestJS backend, and Next.js frontend dashboard.
- **Agent Intelligence**: `SYSTEM_PROMPT.md` and `MODEL_CARD.md` defining ArchMind multi-disciplinary personas and quantitative engineering benchmarks.
- **ESP32 Firmware**: PlatformIO C++ firmware with FreeRTOS task scheduling, hardware watchdog (`esp_task_wdt`), secure MQTT TLS 1.3 transport, exponential backoff reconnection, and mockable I2C sensor drivers.
- **MicroPython Reference**: Minimalist fallback script for rapid bench prototyping.
- **NestJS Backend**:
  - MQTT ingest service with TLS and payload validation.
  - WebSocket gateway emitting `telemetry:update`, `device:status`, `device:connected`, and `device:disconnected`.
  - Dual-persistence engine: relational device metadata storage and time-series telemetry store.
  - REST API with strict DTO validation pipes.
  - AI Agent analysis endpoint (`POST /api/agent/analyze`) with structured JSON schema outputs.
- **Next.js Dashboard**: Real-time telemetry dashboard with live WebSocket state stream, metric gauges, device status indicators, and responsive UI components.
- **Kaggle Notebook**: `KAGGLE_NOTEBOOK.ipynb` containing executable electrical analysis, formula calculations, MQTT payload simulation, and time-series plotting.
- **Docker Compose**: Full local environment orchestration including Mosquitto MQTT broker, PostgreSQL, InfluxDB, backend, and frontend.
- **CI/CD Pipelines**: GitHub Actions workflows for backend, frontend, firmware validation, and security scanning.
- **Engineering Docs**: Comprehensive technical manuals covering architecture, REST API, MQTT topics, hardware schematics, and threat modeling.
