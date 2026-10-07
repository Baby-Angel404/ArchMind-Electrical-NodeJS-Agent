#ifndef ARCHMIND_SENSOR_INTERFACE_H
#define ARCHMIND_SENSOR_INTERFACE_H

#include "telemetry_contract.h"

namespace ArchMind {

class ISensorSubsystem {
public:
    virtual ~ISensorSubsystem() = default;
    virtual bool begin() = 0;
    virtual bool readTelemetry(TelemetryData& outData) = 0;
    virtual bool isHealthy() const = 0;
};

} // namespace ArchMind

#endif // ARCHMIND_SENSOR_INTERFACE_H
