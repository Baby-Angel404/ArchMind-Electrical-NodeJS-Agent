# Threat Model & Cybersecurity Architecture

## 1. STRIDE Threat Matrix

| Threat Category | Edge Device (Firmware) | Communication (MQTT) | Cloud Ingestion & API |
|---|---|---|---|
| **Spoofing** | Rogue device impersonation | Attacker publishing on behalf of node | Unauthorized REST API client calls |
| *Mitigation* | Hardware eFuse Unique ID + mTLS | Pinned CA root, client cert auth | API Key / JWT + HMAC signature |
| **Tampering** | Malicious firmware flashing | Man-in-the-Middle (MitM) packet alter | SQL / Line-Protocol injection |
| *Mitigation* | Secure Boot v2 + Signed OTA binaries | TLS 1.3 encryption (AES-256-GCM) | Parameterized queries + class-validator DTOs |
| **Repudiation** | Clock skew / fake timestamping | Unauthenticated publish packets | Unauthorized config changes |
| *Mitigation* | SNTP time sync + hardware RTC | Broker client authentication logs | Audit log database table with UTC time |
| **Information Disclosure** | Memory readout / JTAG access | Wi-Fi / WAN packet eavesdropping | Sensitive telemetry leakage |
| *Mitigation* | Flash encryption (XTS-AES) + disable JTAG | Port 8883 TLS 1.3 enforced | Role-Based Access Control (RBAC) |
| **Denial of Service** | Sensor bus lockup / WDT hang | Broker message flooding | API DDOS / Memory exhaustion |
| *Mitigation* | Hardware Task WDT + I2C bus recovery | Broker rate limits & max packet size | Express rate limiting (`express-rate-limit`) |
| **Elevation of Privilege**| Buffer overflow in payload parser | Topic wildcard subscription abuse | Admin endpoint tampering |
| *Mitigation* | Static buffer sizing + ArduinoJson | Strict per-device broker ACLs | NestJS AuthGuards + Least Privilege Roles |

---

## 2. OTA Security Flow
1. Developer creates signed binary: `openssl dgst -sha256 -sign ota_private.pem firmware.bin > firmware.sig`.
2. Backend publishes update notification with SHA256 checksum and download URL.
3. ESP32 downloads binary into secondary partition (`ota_1`).
4. Bootloader verifies cryptographic signature using public key fused into ROM/eFuse.
5. If valid, active partition flags switch; upon crash or watchdog trigger, bootloader automatically rolls back to stable partition (`ota_0`).
