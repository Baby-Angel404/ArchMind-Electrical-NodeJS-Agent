# Security Policy

## Supported Versions
| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability
We take the security of embedded hardware and cloud infrastructure seriously. If you discover a vulnerability in ArchMind:

1. **Do not disclose the issue publicly** in GitHub issues or public chat.
2. Report the vulnerability via email to `security@archmind-project.internal` or open a private GitHub Security Advisory.
3. Include the following details in your report:
   - Affected component (firmware, backend, frontend, or broker configuration).
   - Step-by-step reproduction guide or proof-of-concept payload.
   - Assessment of impact (e.g., unauthorized device control, remote code execution, telemetry tampering).

## Security Architecture Principles
ArchMind enforces defense-in-depth across the engineering stack:
- **Transport Layer**: MQTT over TLS 1.3 (Port 8883) with mutual authentication (mTLS) or strong per-device tokens. Unencrypted MQTT (Port 1883) is disabled in production.
- **Microcontroller Security**: Hardware flash encryption, eFuse secure boot, and dual-partition rollback-capable OTA updates.
- **Backend APIs**: Strict input sanitization via NestJS `ValidationPipe` with `class-validator` (whitelisting enabled, forbidden unknown properties), Helmet security headers, CORS origin restrictions, and rate limiting.
- **Broker ACLs**: Rigid topic isolation preventing devices from cross-subscribing or spoofing peer device streams.
- **Credential Hygiene**: Zero hardcoded secrets in source files. All configuration injected via `.env` files and environment variables.
