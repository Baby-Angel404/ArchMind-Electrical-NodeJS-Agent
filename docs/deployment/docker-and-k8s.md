# Deployment Architecture: Docker & Cloud Topology

## 1. Local & Production Docker Compose Topology

ArchMind packages the complete cyber-physical stack into coordinated microservices:

```mermaid
graph LR
    subgraph Host Network
        ESP32[Physical ESP32 Node]
    end

    subgraph Docker Network: archmind-net
        Mosquitto[Eclipse Mosquitto MQTT: 8883/1883]
        PG[(PostgreSQL 16: 5432)]
        Influx[(InfluxDB 2.7: 8086)]
        Backend[NestJS Backend API: 4000]
        Frontend[Next.js 14 Dashboard: 3000]

        ESP32 -->|TLS 8883| Mosquitto
        Mosquitto -->|devices/+/telemetry| Backend
        Backend --> PG
        Backend --> Influx
        Frontend -->|HTTP / WS: 4000| Backend
    end
```

## 2. Running Local Development Stack

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Build and launch all services in detached mode
docker compose up -d --build

# 3. Check container status
docker compose ps

# 4. Follow backend logs
docker compose logs -f backend
```

## 3. Production Hardening Checklist
- Disable cleartext MQTT port `1883` on the host; expose only `8883` over TLS.
- Mount read-only volume certificates for Mosquitto and NestJS.
- Isolate PostgreSQL and InfluxDB inside the internal Docker network (`archmind-net`), never exposing database ports to the public internet.
- Inject database passwords and API tokens using Docker secrets or Kubernetes HashiCorp Vault sidecars.
