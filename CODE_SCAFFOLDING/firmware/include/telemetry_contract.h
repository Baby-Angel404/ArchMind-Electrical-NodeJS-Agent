#ifndef ARCHMIND_TELEMETRY_CONTRACT_H
#define ARCHMIND_TELEMETRY_CONTRACT_H

#include <string>
#include <sstream>
#include <iomanip>

namespace ArchMind {

struct TelemetryData {
    std::string deviceId;
    std::string timestamp; // ISO 8601 UTC
    float voltage;         // Volts RMS (e.g. 230.2)
    float current;         // Amperes RMS (e.g. 4.82)
    float power;           // Watts Active Power (e.g. 1109.56)
    float temperature;     // Celsius (e.g. 36.4)
    float frequency;       // Hertz (e.g. 50.0)
    float powerFactor;     // Dimensionless (0.0 - 1.0)

    // Calculate active power from V, I, and PF
    void computePower() {
        if (powerFactor <= 0.0f || powerFactor > 1.0f) {
            powerFactor = 1.0f;
        }
        power = voltage * current * powerFactor;
    }

    // Serialize to standard JSON matching backend contract
    std::string toJsonString() const {
        std::ostringstream ss;
        ss << std::fixed << std::setprecision(2);
        ss << "{\n"
           << "  \"deviceId\": \"" << deviceId << "\",\n"
           << "  \"timestamp\": \"" << timestamp << "\",\n"
           << "  \"voltage\": " << voltage << ",\n"
           << "  \"current\": " << current << ",\n"
           << "  \"power\": " << power << ",\n"
           << "  \"temperature\": " << temperature << ",\n"
           << "  \"frequency\": " << frequency << ",\n"
           << "  \"powerFactor\": " << powerFactor << "\n"
           << "}";
        return ss.str();
    }

    // Validation logic
    bool isValid() const {
        if (deviceId.empty()) return false;
        if (voltage < 0.0f || voltage > 600.0f) return false;     // Sane AC limit
        if (current < 0.0f || current > 200.0f) return false;     // Sane current limit
        if (temperature < -40.0f || temperature > 125.0f) return false; // Sensor rating
        return true;
    }
};

} // namespace ArchMind

#endif // ARCHMIND_TELEMETRY_CONTRACT_H
