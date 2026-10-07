import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TelemetryWebsocketGateway } from '../websocket/websocket.gateway';
import { IngestTelemetryDto } from '../common/dto/telemetry.dto';
import { TelemetryMessage } from '../common/interfaces/telemetry.interface';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly websocketGateway: TelemetryWebsocketGateway,
  ) {}

  async processTelemetry(dto: IngestTelemetryDto): Promise<TelemetryMessage> {
    const telemetry: TelemetryMessage = {
      deviceId: dto.deviceId,
      timestamp: dto.timestamp || new Date().toISOString(),
      voltage: dto.voltage,
      current: dto.current,
      power: dto.power !== undefined ? dto.power : (dto.voltage || 0) * (dto.current || 0) * (dto.powerFactor || 1),
      temperature: dto.temperature,
      frequency: dto.frequency || 50.0,
      powerFactor: dto.powerFactor || 1.0,
    };

    // Anomaly & Threshold Checks
    if (telemetry.voltage && telemetry.voltage > 253.0) {
      this.logger.warn(`[ELECTRICAL ALERT] Over-voltage detected on ${telemetry.deviceId}: ${telemetry.voltage}V`);
    }
    if (telemetry.temperature && telemetry.temperature > 75.0) {
      this.logger.warn(`[THERMAL ALERT] High temperature detected on ${telemetry.deviceId}: ${telemetry.temperature}°C`);
    }

    // Persist to dual-store
    await this.databaseService.saveTelemetry(telemetry);

    // Stream real-time updates to WebSocket clients
    this.websocketGateway.broadcastTelemetry(telemetry);

    return telemetry;
  }

  async getRecent(deviceId: string, limit = 50): Promise<TelemetryMessage[]> {
    return this.databaseService.getRecentTelemetry(deviceId, limit);
  }
}
