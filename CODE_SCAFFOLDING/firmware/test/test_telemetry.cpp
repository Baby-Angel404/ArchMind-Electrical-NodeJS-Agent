#include <iostream>
#include <cassert>
#include <cmath>
#include "../include/telemetry_contract.h"
#include "../include/mock_sensor.h"

void testActivePowerComputation() {
    std::cout << "[TEST] Running testActivePowerComputation...\n";
    ArchMind::TelemetryData data;
    data.deviceId = "esp32-node-unit";
    data.timestamp = "2026-10-08T04:20:00Z";
    data.voltage = 230.0f;
    data.current = 5.0f;
    data.powerFactor = 0.95f;
    data.temperature = 35.0f;
    data.frequency = 50.0f;
    data.computePower();

    float expectedPower = 230.0f * 5.0f * 0.95f; // 1092.5 W
    assert(std::fabs(data.power - expectedPower) < 0.01f);
    assert(data.isValid());
    std::cout << "  ✓ Active power verified: " << data.power << " W\n";
}

void testValidationLimits() {
    std::cout << "[TEST] Running testValidationLimits...\n";
    ArchMind::TelemetryData data;
    data.deviceId = "esp32-node-unit";
    data.timestamp = "2026-10-08T04:20:00Z";
    data.voltage = 750.0f; // Exceeds safe 600V limit
    data.current = 5.0f;
    data.temperature = 25.0f;
    assert(!data.isValid());

    data.voltage = 230.0f;
    data.temperature = 140.0f; // Exceeds max 125C rating
    assert(!data.isValid());

    data.temperature = 40.0f;
    assert(data.isValid());
    std::cout << "  ✓ Validation limits properly rejected unsafe values\n";
}

void testMockSensorAcquisition() {
    std::cout << "[TEST] Running testMockSensorAcquisition...\n";
    ArchMind::MockSensorSubsystem sensor("esp32-node-001", 230.0f, 4.8f, 36.0f);
    assert(sensor.begin());
    assert(sensor.isHealthy());

    ArchMind::TelemetryData sample;
    bool ok = sensor.readTelemetry(sample);
    assert(ok);
    assert(sample.deviceId == "esp32-node-001");
    assert(sample.voltage > 220.0f && sample.voltage < 240.0f);
    assert(sample.current > 4.0f && sample.current < 6.0f);
    assert(sample.power > 800.0f && sample.power < 1400.0f);
    assert(sample.isValid());
    std::cout << "  ✓ Mock sensor acquisition verified: " << sample.voltage << "V, " << sample.current << "A\n";
}

void testJsonOutputFormat() {
    std::cout << "[TEST] Running testJsonOutputFormat...\n";
    ArchMind::TelemetryData data;
    data.deviceId = "esp32-test";
    data.timestamp = "2026-10-08T04:20:00Z";
    data.voltage = 230.2f;
    data.current = 4.82f;
    data.power = 1109.56f;
    data.temperature = 36.4f;
    data.frequency = 50.0f;
    data.powerFactor = 0.98f;

    std::string json = data.toJsonString();
    assert(json.find("\"deviceId\": \"esp32-test\"") != std::string::npos);
    assert(json.find("\"voltage\": 230.20") != std::string::npos);
    assert(json.find("\"power\": 1109.56") != std::string::npos);
    std::cout << "  ✓ JSON format verified against schema contract\n";
}

int main() {
    std::cout << "===========================================\n";
    std::cout << " ArchMind Firmware Native Unit Test Suite  \n";
    std::cout << "===========================================\n";
    testActivePowerComputation();
    testValidationLimits();
    testMockSensorAcquisition();
    testJsonOutputFormat();
    std::cout << "All firmware protocol and math unit tests PASSED successfully.\n";
    return 0;
}
