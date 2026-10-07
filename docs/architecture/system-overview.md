# System Architecture Overview

## 1. High-Level Cyber-Physical Pipeline

ArchMind links the physical electronics domain with real-time cloud analytics and AI reasoning engines:

```mermaid
flowchart TD
    subgraph Edge ["Physical & Edge Tier"]
        Sensor[Current / Voltage / Temp Sensors] -->|Analog / I2C| MCU[ESP32 / STM32 Edge Node]
        WDT[Hardware WDT & Brownout] -.-> MCU
        MCU -->|MQTT TLS 1.3 / Port 8883| Broker[MQTT Broker (Mosquitto/EMQX)]
    end

    subgraph Ingestion ["Ingestion & Microservices Tier (NestJS)"]
        Broker -->|devices/+/telemetry| MQTT_Service[MQTT Ingest Service]
        MQTT_Service --> Validate[DTO & Zod Validation Engine]
        Validate --> EventBus[Internal Reactive Event Bus]
    end

    subgraph Storage ["Dual Persistence Tier"]
        EventBus -->|Device State & Registry| PG[(PostgreSQL Relational DB)]
        EventBus -->|High-Frequency Time-Series| Influx[(InfluxDB / TimescaleDB)]
    end

    subgraph Presentation ["Presentation & Intelligence Tier"]
        EventBus --> WS_Gateway[WebSocket Gateway]
        WS_Gateway -->|telemetry:update| Dashboard[Next.js 14 Dashboard]
        REST_API[REST API Controllers] --> Dashboard
        REST_API --> AI_Agent[ArchMind AI Engineering Agent]
    end
```

## 2. Component Breakdown

### 2.1 Edge Microcontroller (ESP32)
- Dual-core Xtensa LX6 @ 240MHz.
- Core 0 runs networking (Wi-Fi, TLS handshake, MQTT client loop).
- Core 1 executes deterministic sensor sampling (I2C at 100kHz/400kHz, ADC filtering) and feeds the hardware Watchdog Timer (`esp_task_wdt`).
- Cryptographic mTLS communication with broker; certificates stored in secure partition or NVS.

### 2.2 Broker Tier (Mosquitto / EMQX)
- Enforces TLS 1.3 encryption on port 8883.
- Strict Access Control Lists (ACL): devices are restricted to their assigned topic namespace `devices/{deviceId}/*`.

### 2.3 Backend Microservices (NestJS)
- Ingests telemetry via `mqtt.js` client.
- Transforms raw JSON payloads into validated TypeScript DTOs.
- Routes data into a dual-persistence layer:
  - **PostgreSQL**: Stores device configuration, serial numbers, hardware revisions, and calibration constants.
  - **InfluxDB**: High-speed time-series engine for voltage, current, power, and temperature data points.
- Dispatches instantaneous events to connected web clients via WebSockets (`socket.io`).

### 2.4 Frontend Dashboard (Next.js)
- Server-side rendered shell with responsive client-side telemetry panels.
- Live reactive metrics with zero HTTP polling overhead.

### 2.5 AI Engineering Agent
- Analyzes incoming telemetry anomalies, computes power factors, thermal risks, and assists engineers with component selection and FMEA analysis via structured REST endpoints (`POST /api/agent/analyze`).
