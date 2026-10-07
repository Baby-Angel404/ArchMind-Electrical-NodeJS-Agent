export interface TelemetryData {
  deviceId: string;
  timestamp: string;
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  frequency?: number;
  powerFactor?: number;
}

export interface DeviceInfo {
  deviceId: string;
  name: string;
  hardwareModel: string;
  firmwareVersion: string;
  location?: string;
  status: 'online' | 'offline';
  registeredAt: string;
  lastSeen?: string;
}

export interface AgentAnalysis {
  summary: string;
  architecture: string[];
  risks: string[];
  recommendations: string[];
  tests: string[];
  confidence: number;
}
