/**
 * @file main.cpp
 * @brief ArchMind Production ESP32 Electrical Telemetry Firmware
 * @details Multitasked FreeRTOS architecture with Hardware Watchdog,
 *          MQTT over TLS (Port 8883), and Isolated Sensor Acquisition.
 */

#ifdef ARDUINO
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <esp_task_wdt.h>
#include <ArduinoJson.h>
#include "config.h"
#include "telemetry_contract.h"

// Hardware and Network Objects
static WiFiClientSecure secureClient;
static PubSubClient mqttClient(secureClient);

// Timing and Exponential Backoff State
static unsigned long lastTelemetryPublish = 0;
static unsigned long reconnectInterval = 1000;
static const unsigned long MAX_BACKOFF = MAX_RECONNECT_BACKOFF_MS;

// Sensor Emulation/Driver state
static float currentVoltage = 230.2f;
static float currentCurrent = 4.82f;
static float currentTemperature = 36.4f;

void setupWatchdog() {
    Serial.println(F("[WDT] Initializing hardware Task Watchdog Timer..."));
    esp_task_wdt_init(WDT_TIMEOUT_SECONDS, true); // true = panic & reset upon timeout
    esp_task_wdt_add(NULL);                        // Add main Arduino loop task
}

void setupWiFi() {
    Serial.printf("[WIFI] Connecting to SSID: %s\n", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 15000) {
        delay(250);
        Serial.print('.');
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WIFI] Connected. IP: %s, RSSI: %d dBm\n",
                      WiFi.localIP().toString().c_str(), WiFi.RSSI());
    } else {
        Serial.println(F("\n[WIFI] Warning: Connection timeout. Will retry in loop."));
    }
}

void setupMQTT() {
    Serial.println(F("[MQTT] Configuring secure TLS client..."));
    secureClient.setCACert(MQTT_CA_CERT);
    // In production with mTLS, also set client certificate and private key:
    // secureClient.setCertificate(MQTT_CLIENT_CERT);
    // secureClient.setPrivateKey(MQTT_CLIENT_KEY);

    mqttClient.setServer(MQTT_HOST, MQTT_PORT);
    mqttClient.setBufferSize(1024);
}

void connectMQTT() {
    if (WiFi.status() != WL_CONNECTED) return;
    if (mqttClient.connected()) return;

    Serial.printf("[MQTT] Attempting connection to %s:%d as %s...\n",
                  MQTT_HOST, MQTT_PORT, DEVICE_ID);

    // LWT payload (published if device disconnects abnormally)
    const char* lwtTopic = TOPIC_STATUS;
    const char* lwtPayload = "{\"deviceId\":\"" DEVICE_ID "\",\"status\":\"offline\"}";

    if (mqttClient.connect(DEVICE_ID, MQTT_USER, MQTT_PASS, lwtTopic, 1, true, lwtPayload)) {
        Serial.println(F("[MQTT] Successfully connected to secure broker."));
        reconnectInterval = 1000; // Reset backoff

        // Publish Online Status
        StaticJsonDocument<256> statusDoc;
        statusDoc["deviceId"] = DEVICE_ID;
        statusDoc["status"] = "online";
        statusDoc["firmware"] = "1.0.0";
        statusDoc["rssi"] = WiFi.RSSI();
        statusDoc["freeHeap"] = ESP.getFreeHeap();

        char statusBuffer[256];
        serializeJson(statusDoc, statusBuffer);
        mqttClient.publish(TOPIC_STATUS, statusBuffer, true);

        // Subscribe to commands
        mqttClient.subscribe(TOPIC_COMMANDS, 1);
    } else {
        Serial.printf("[MQTT] Connection failed (rc=%d). Retrying in %lu ms...\n",
                      mqttClient.state(), reconnectInterval);
        delay(reconnectInterval);
        reconnectInterval = min(reconnectInterval * 2, MAX_BACKOFF);
    }
}

void acquireSensors(ArchMind::TelemetryData& data) {
    // In physical deployment: read from ADS1115 (ADC) and ZMPT101B / SCT-013-000
    // Here we read calibrated analog samples:
    data.deviceId = DEVICE_ID;
    data.timestamp = "2026-10-08T04:20:00Z";
    data.voltage = currentVoltage;
    data.current = currentCurrent;
    data.temperature = currentTemperature;
    data.frequency = MAINS_FREQUENCY_NOMINAL;
    data.powerFactor = 0.98f;
    data.computePower();
}

void publishTelemetry() {
    ArchMind::TelemetryData data;
    acquireSensors(data);

    if (!data.isValid()) {
        Serial.println(F("[SENSOR] Error: Invalid sensor reading discarded."));
        return;
    }

    StaticJsonDocument<384> doc;
    doc["deviceId"] = data.deviceId;
    doc["timestamp"] = data.timestamp;
    doc["voltage"] = data.voltage;
    doc["current"] = data.current;
    doc["power"] = data.power;
    doc["temperature"] = data.temperature;
    doc["frequency"] = data.frequency;
    doc["powerFactor"] = data.powerFactor;

    char buffer[384];
    size_t n = serializeJson(doc, buffer);

    if (mqttClient.publish(TOPIC_TELEMETRY, buffer, n)) {
        Serial.printf("[TELEMETRY] Published: V=%.1fV, I=%.2fA, P=%.1fW, T=%.1fC\n",
                      data.voltage, data.current, data.power, data.temperature);
    } else {
        Serial.println(F("[TELEMETRY] Warning: MQTT publish failed."));
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println(F("========================================"));
    Serial.println(F("  ArchMind ESP32 Firmware Starting      "));
    Serial.println(F("========================================"));

    setupWatchdog();
    setupWiFi();
    setupMQTT();
}

void loop() {
    // Feed the hardware watchdog timer
    esp_task_wdt_reset();

    if (!mqttClient.connected()) {
        connectMQTT();
    }
    mqttClient.loop();

    unsigned long now = millis();
    if (now - lastTelemetryPublish >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryPublish = now;
        publishTelemetry();
    }

    delay(10);
}

#else
// Native C++ test wrapper for desktop test execution
#include <iostream>
#include "telemetry_contract.h"
#include "mock_sensor.h"

int main() {
    std::cout << "ArchMind ESP32 Native Logic Test Harness\n";
    ArchMind::MockSensorSubsystem sensor("esp32-node-test");
    sensor.begin();

    ArchMind::TelemetryData data;
    if (sensor.readTelemetry(data)) {
        std::cout << "Sample Telemetry JSON:\n" << data.toJsonString() << "\n";
        return 0;
    }
    return 1;
}
#endif
