# ArchMind ESP32 Firmware Subsystem

## Overview
This directory contains production-grade ESP32 firmware written in C++ (PlatformIO / Arduino Core with FreeRTOS) alongside a MicroPython bench script.

## Directory Structure
```text
firmware/
├── platformio.ini           # PlatformIO environment and library dependencies
├── src/
│   └── main.cpp             # FreeRTOS tasks, secure MQTT TLS, and sensor loop
├── include/
│   ├── config.h             # Configuration, topics, and TLS certificates
│   ├── telemetry_contract.h # Type-safe C++ struct and JSON serializer
│   ├── sensor_interface.h   # Abstract sensor interface (ISensorSubsystem)
│   └── mock_sensor.h        # Deterministic sensor mock for testing
├── test/
│   └── test_telemetry.cpp   # Native C++ unit test suite
└── micropython/
    └── main.py              # MicroPython fallback script
```

## Features
- **Hardware Watchdog**: Integrated `esp_task_wdt` resets the MCU if the FreeRTOS loop freezes for $>15$ seconds.
- **Secure Transport**: MQTT over TLS (Port 8883) with X.509 CA certificate pinning.
- **Resilient Reconnection**: Exponential backoff (1s up to 30s) prevents network storming.
- **LWT (Last Will and Testament)**: Notifies the cloud immediately when a device loses power or Wi-Fi unexpectedly.

## Building and Flashing
```bash
# 1. Install PlatformIO CLI
pip install platformio

# 2. Build for ESP32
pio run -e esp32dev

# 3. Flash to connected board
pio run -e esp32dev --target upload

# 4. Run native desktop unit tests (no physical hardware required)
g++ -std=c++17 test/test_telemetry.cpp -Iinclude -o test_runner && ./test_runner
```
