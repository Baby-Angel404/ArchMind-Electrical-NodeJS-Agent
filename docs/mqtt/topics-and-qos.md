# MQTT Topic Topology & QoS Specifications

## 1. Topic Hierarchy

ArchMind establishes a deterministic MQTT namespace ensuring tenant separation and least-privilege broker ACLs:

```text
devices/{deviceId}/telemetry      [Device -> Broker] QoS 1
devices/{deviceId}/status         [Device -> Broker] QoS 1 (Retained, LWT)
devices/{deviceId}/commands       [Backend -> Device] QoS 1
devices/{deviceId}/config         [Backend -> Device] QoS 1 (Retained)
```

---

## 2. Telemetry Payload Contract
- **Topic**: `devices/{deviceId}/telemetry`
- **Direction**: Device to Broker
- **QoS**: 1 (At least once delivery)
- **Content-Type**: `application/json`

```json
{
  "deviceId": "esp32-node-001",
  "timestamp": "2026-10-08T04:20:00.000Z",
  "voltage": 230.25,
  "current": 4.82,
  "power": 1109.80,
  "temperature": 36.40,
  "frequency": 50.02,
  "powerFactor": 0.98
}
```

---

## 3. Last Will and Testament (LWT) & Status
- **Topic**: `devices/{deviceId}/status`
- **Direction**: Device to Broker (Automated broker publication upon unexpected disconnect)
- **QoS**: 1
- **Retained**: `true`

**Online Payload (Published by device upon successful handshake)**:
```json
{
  "deviceId": "esp32-node-001",
  "status": "online",
  "firmware": "1.0.0",
  "ip": "192.168.1.150",
  "rssi": -58,
  "freeHeap": 184200,
  "timestamp": "2026-10-08T04:19:00.000Z"
}
```

**Offline Payload (LWT configured in MQTT CONNECT packet)**:
```json
{
  "deviceId": "esp32-node-001",
  "status": "offline",
  "reason": "connection_lost",
  "timestamp": "2026-10-08T04:25:12.000Z"
}
```

---

## 4. Broker Access Control Lists (ACL)
Mosquitto ACL rule enforcement:

```text
# Device esp32-node-001 permissions
user device_esp32_001
topic write devices/esp32-node-001/telemetry
topic write devices/esp32-node-001/status
topic read devices/esp32-node-001/commands
topic read devices/esp32-node-001/config

# Backend ingestion service permissions
user archmind_backend
topic read devices/+/telemetry
topic read devices/+/status
topic write devices/+/commands
topic write devices/+/config
```
