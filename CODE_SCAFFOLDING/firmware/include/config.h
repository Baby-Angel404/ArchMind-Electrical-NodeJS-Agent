#ifndef ARCHMIND_CONFIG_H
#define ARCHMIND_CONFIG_H

// Network & Broker Configuration
// NOTE: Values are populated from build flags or local credentials header.
// DO NOT COMMIT REAL CREDENTIALS.
#ifndef WIFI_SSID
#define WIFI_SSID "YOUR_WIFI_SSID"
#endif

#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#endif

#ifndef MQTT_HOST
#define MQTT_HOST "broker.archmind.internal"
#endif

#ifndef MQTT_PORT
#define MQTT_PORT 8883 // Secure MQTT port over TLS
#endif

#ifndef DEVICE_ID
#define DEVICE_ID "esp32-node-001"
#endif

#ifndef MQTT_USER
#define MQTT_USER "device_esp32_001"
#endif

#ifndef MQTT_PASS
#define MQTT_PASS "YOUR_DEVICE_MQTT_PASSWORD"
#endif

// Topic Namespaces
#define TOPIC_TELEMETRY "devices/" DEVICE_ID "/telemetry"
#define TOPIC_STATUS    "devices/" DEVICE_ID "/status"
#define TOPIC_COMMANDS  "devices/" DEVICE_ID "/commands"

// Timing & Watchdog Constants
#define TELEMETRY_INTERVAL_MS 5000
#define WDT_TIMEOUT_SECONDS    15
#define MAX_RECONNECT_BACKOFF_MS 30000

// Sensor Calibration Constants
#define VOLTAGE_CALIBRATION_FACTOR 230.0f
#define CURRENT_CALIBRATION_FACTOR 30.0f
#define MAINS_FREQUENCY_NOMINAL    50.0f

// CA Certificate for MQTT TLS (PEM format placeholder)
static const char MQTT_CA_CERT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRQB40539NZswDQYJKoZIhvcNAQELBQAw
...PLACEHOLDER_ARCHMIND_ROOT_CA_CERTIFICATE...
-----END CERTIFICATE-----
)EOF";

#endif // ARCHMIND_CONFIG_H
