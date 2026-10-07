# REST API Reference

All REST endpoints are prefixed with `/api` (or `/health` for cluster liveness).

## Endpoints Summary

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | No | System health and service readiness check |
| `GET` | `/api/devices` | Yes (API Key / Bearer) | List registered hardware nodes |
| `GET` | `/api/devices/:id` | Yes (API Key / Bearer) | Get specific hardware node details |
| `POST` | `/api/devices` | Yes (Admin API Key) | Register a new hardware node |
| `GET` | `/api/telemetry/:deviceId` | Yes (API Key / Bearer) | Retrieve recent telemetry records |
| `POST` | `/api/agent/analyze` | Yes (API Key / Bearer) | Submit architecture context to AI agent |

---

## 1. Health Check
`GET /health`

**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "uptime": 12845.2,
  "timestamp": "2026-10-08T04:20:00.000Z",
  "services": {
    "database": "connected",
    "mqtt": "connected",
    "influxdb": "connected"
  }
}
```

---

## 2. Device Registration
`POST /api/devices`

**Request Body**:
```json
{
  "deviceId": "esp32-node-alpha",
  "name": "Main Distribution Panel Monitor",
  "hardwareModel": "ESP32-WROOM-32E",
  "firmwareVersion": "1.0.0",
  "location": "Electrical Room B"
}
```

**Response (`201 Created`)**:
```json
{
  "deviceId": "esp32-node-alpha",
  "name": "Main Distribution Panel Monitor",
  "hardwareModel": "ESP32-WROOM-32E",
  "firmwareVersion": "1.0.0",
  "location": "Electrical Room B",
  "status": "offline",
  "registeredAt": "2026-10-08T04:20:00.000Z",
  "lastSeen": null
}
```

---

## 3. Query Telemetry
`GET /api/telemetry/esp32-node-alpha?limit=50`

**Response (`200 OK`)**:
```json
[
  {
    "deviceId": "esp32-node-alpha",
    "timestamp": "2026-10-08T04:19:55.000Z",
    "voltage": 230.4,
    "current": 4.85,
    "power": 1117.44,
    "temperature": 38.2
  }
]
```

---

## 4. AI Engineering Analysis
`POST /api/agent/analyze`

**Request Body**:
```json
{
  "task": "Analyze power supply thermal dissipation",
  "context": {
    "hardware": [
      { "component": "LDO Regulator", "vin": 12.0, "vout": 3.3, "current": 0.5, "package": "SOT-223", "thetaJA": 62.0 }
    ],
    "firmware": [
      { "mcu": "ESP32", "clockMhz": 240, "sleepMode": "none" }
    ],
    "requirements": [
      { "maxAmbientTemp": 50.0, "targetJunctionTempLimit": 110.0 }
    ]
  }
}
```

**Response (`200 OK`)**:
```json
{
  "summary": "Linear regulator power dissipation exceeds passive thermal limit at 50°C ambient.",
  "architecture": [
    "Replace linear regulator with a high-efficiency synchronous buck converter (e.g., TI TPS54302 or Monolithic Power MP2315).",
    "Add Pi-filter (LC) on buck output to suppress 500kHz switching ripple before feeding ESP32 analog rails."
  ],
  "risks": [
    "Calculated power dissipation: (12V - 3.3V) * 0.5A = 4.35W.",
    "Junction temperature: Tj = 50°C + (4.35W * 62°C/W) = 319.7°C, which guarantees thermal shutdown or catastrophic silicon destruction."
  ],
  "recommendations": [
    "Switching regulator yields >88% efficiency, reducing dissipation from 4.35W to ~0.22W.",
    "Derate input ceramic capacitors to 25V or 35V rating for 12V rail (100% margin for inductive flyback spikes)."
  ],
  "tests": [
    "Measure thermal profile with FLIR infrared camera at full 500mA load.",
    "Measure Vout ripple with 20MHz oscilloscope bandwidth limit to verify ripple < 30mVpp."
  ],
  "confidence": 0.98
}
```
