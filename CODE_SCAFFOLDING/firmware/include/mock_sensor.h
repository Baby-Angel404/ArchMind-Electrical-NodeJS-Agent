#ifndef ARCHMIND_MOCK_SENSOR_H
#define ARCHMIND_MOCK_SENSOR_H

#include "sensor_interface.h"
#include <cstdint>
#include <cmath>

namespace ArchMind {

class MockSensorSubsystem : public ISensorSubsystem {
private:
    std::string m_deviceId;
    float m_baseVoltage;
    float m_baseCurrent;
    float m_baseTemp;
    uint32_t m_stepCounter;
    bool m_initialized;

public:
    explicit MockSensorSubsystem(const std::string& deviceId = "esp32-node-001",
                                float baseVoltage = 230.0f,
                                float baseCurrent = 4.8f,
                                float baseTemp = 36.0f)
        : m_deviceId(deviceId),
          m_baseVoltage(baseVoltage),
          m_baseCurrent(baseCurrent),
          m_baseTemp(baseTemp),
          m_stepCounter(0),
          m_initialized(false) {}

    bool begin() override {
        m_initialized = true;
        m_stepCounter = 0;
        return true;
    }

    bool isHealthy() const override {
        return m_initialized;
    }

    bool readTelemetry(TelemetryData& outData) override {
        if (!m_initialized) return false;

        m_stepCounter++;
        // Produce subtle synthetic sinusoidal jitter around electrical nominals
        float jitter = std::sin(static_cast<float>(m_stepCounter) * 0.1f);

        outData.deviceId = m_deviceId;
        outData.timestamp = "2026-10-08T04:20:00Z";
        outData.voltage = m_baseVoltage + (jitter * 1.5f);
        outData.current = m_baseCurrent + (jitter * 0.2f);
        outData.temperature = m_baseTemp + (jitter * 0.8f);
        outData.frequency = 50.0f + (jitter * 0.05f);
        outData.powerFactor = 0.98f;
        outData.computePower();

        return outData.isValid();
    }
};

} // namespace ArchMind

#endif // ARCHMIND_MOCK_SENSOR_H
