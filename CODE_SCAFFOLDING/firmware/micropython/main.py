"""
ArchMind ESP32 MicroPython Rapid Prototyping Script
Features: Wi-Fi STA, umqtt.simple with TLS, and sensor telemetry loop.
"""

import time
import ujson
import machine
import network
from umqtt.simple import MQTTClient

# Configuration constants
WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASS = "YOUR_WIFI_PASSWORD"
MQTT_HOST = "broker.archmind.internal"
MQTT_PORT = 8883
DEVICE_ID = "esp32-mpy-001"
TOPIC_TELEMETRY = f"devices/{DEVICE_ID}/telemetry"
TOPIC_STATUS = f"devices/{DEVICE_ID}/status"

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print(f"[WIFI] Connecting to {WIFI_SSID}...")
        wlan.connect(WIFI_SSID, WIFI_PASS)
        for _ in range(30):
            if wlan.isconnected():
                break
            time.sleep(0.5)
    print("[WIFI] Connected:", wlan.ifconfig())

def main():
    connect_wifi()
    
    # Configure secure MQTT client with SSL/TLS
    client = MQTTClient(
        client_id=DEVICE_ID,
        server=MQTT_HOST,
        port=MQTT_PORT,
        ssl=True
    )
    
    # Set Last Will and Testament
    lwt_payload = ujson.dumps({"deviceId": DEVICE_ID, "status": "offline"})
    client.set_last_will(TOPIC_STATUS, lwt_payload, retain=True, qos=1)
    
    print(f"[MQTT] Connecting to {MQTT_HOST}:{MQTT_PORT}...")
    client.connect()
    
    # Send online status
    status_payload = ujson.dumps({"deviceId": DEVICE_ID, "status": "online", "runtime": "micropython"})
    client.publish(TOPIC_STATUS, status_payload, retain=True, qos=1)
    print("[MQTT] Connected & Status published.")
    
    # Telemetry sampling loop
    while True:
        telemetry = {
            "deviceId": DEVICE_ID,
            "timestamp": "2026-10-08T04:20:00Z",
            "voltage": 230.1,
            "current": 4.80,
            "power": 1104.48,
            "temperature": 36.2
        }
        client.publish(TOPIC_TELEMETRY, ujson.dumps(telemetry), qos=1)
        print("[TELEMETRY] Published:", telemetry)
        time.sleep(5)

if __name__ == "__main__":
    main()
