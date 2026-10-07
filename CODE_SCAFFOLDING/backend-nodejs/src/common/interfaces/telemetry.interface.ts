export interface TelemetryMessage {
  deviceId: string;
  timestamp: string;
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  frequency?: number;
  powerFactor?: number;
}

export interface DeviceRecord {
  deviceId: string;
  name: string;
  hardwareModel: string;
  firmwareVersion: string;
  location?: string;
  status: 'online' | 'offline';
  registeredAt: string;
  lastSeen?: string;
}
