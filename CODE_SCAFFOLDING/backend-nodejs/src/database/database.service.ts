import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DeviceRecord, TelemetryMessage } from '../common/interfaces/telemetry.interface';
import { CreateDeviceDto } from '../common/dto/device.dto';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly devices = new Map<string, DeviceRecord>();
  private readonly telemetryStore: TelemetryMessage[] = [];

  onModuleInit() {
    this.logger.log('DatabaseService initialized. Applying schema definitions...');
    this.seedDefaultDevices();
  }

  private seedDefaultDevices() {
    const defaultDevice: DeviceRecord = {
      deviceId: 'esp32-node-001',
      name: 'Main Distribution Feeder 1',
      hardwareModel: 'ESP32-WROOM-32E',
      firmwareVersion: '1.0.0',
      location: 'Substation Electrical Room A',
      status: 'online',
      registeredAt: new Date(Date.now() - 3600000).toISOString(),
      lastSeen: new Date().toISOString(),
    };
    this.devices.set(defaultDevice.deviceId, defaultDevice);
  }

  // Device Registry Operations
  async getAllDevices(): Promise<DeviceRecord[]> {
    return Array.from(this.devices.values());
  }

  async getDeviceById(deviceId: string): Promise<DeviceRecord | null> {
    return this.devices.get(deviceId) || null;
  }

  async createDevice(dto: CreateDeviceDto): Promise<DeviceRecord> {
    const newDevice: DeviceRecord = {
      deviceId: dto.deviceId,
      name: dto.name,
      hardwareModel: dto.hardwareModel,
      firmwareVersion: dto.firmwareVersion,
      location: dto.location || 'Unassigned',
      status: 'offline',
      registeredAt: new Date().toISOString(),
    };
    this.devices.set(newDevice.deviceId, newDevice);
    this.logger.log(`Device registered: ${newDevice.deviceId} (${newDevice.name})`);
    return newDevice;
  }

  async updateDeviceStatus(deviceId: string, status: 'online' | 'offline'): Promise<void> {
    const existing = this.devices.get(deviceId);
    if (existing) {
      existing.status = status;
      existing.lastSeen = new Date().toISOString();
      this.devices.set(deviceId, existing);
    }
  }

  // Telemetry Operations
  async saveTelemetry(telemetry: TelemetryMessage): Promise<void> {
    this.telemetryStore.push(telemetry);
    // Keep bounded in-memory buffer
    if (this.telemetryStore.length > 5000) {
      this.telemetryStore.shift();
    }

    // Touch device lastSeen and mark online
    await this.updateDeviceStatus(telemetry.deviceId, 'online');
  }

  async getRecentTelemetry(deviceId: string, limit = 50): Promise<TelemetryMessage[]> {
    return this.telemetryStore
      .filter((t) => t.deviceId === deviceId)
      .slice(-limit);
  }

  // PostgreSQL Migration Script Generator (for schema audits & production deployments)
  getSqlMigrationScript(): string {
    return `
-- ArchMind PostgreSQL Schema Migration
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    hardware_model VARCHAR(64) NOT NULL,
    firmware_version VARCHAR(32) NOT NULL,
    location VARCHAR(128),
    status VARCHAR(16) DEFAULT 'offline',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS telemetry_audit (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(64) REFERENCES devices(device_id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    voltage NUMERIC(6, 2),
    current NUMERIC(6, 2),
    power NUMERIC(8, 2),
    temperature NUMERIC(5, 2),
    frequency NUMERIC(5, 2),
    power_factor NUMERIC(4, 2)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON telemetry_audit(device_id, recorded_at DESC);
`;
  }
}
