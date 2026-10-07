import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDeviceDto } from '../common/dto/device.dto';
import { DeviceRecord } from '../common/interfaces/telemetry.interface';
import { TelemetryWebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class DevicesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly websocketGateway: TelemetryWebsocketGateway,
  ) {}

  async findAll(): Promise<DeviceRecord[]> {
    return this.databaseService.getAllDevices();
  }

  async findOne(deviceId: string): Promise<DeviceRecord> {
    const device = await this.databaseService.getDeviceById(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID '${deviceId}' not found`);
    }
    return device;
  }

  async create(dto: CreateDeviceDto): Promise<DeviceRecord> {
    const created = await this.databaseService.createDevice(dto);
    this.websocketGateway.broadcastDeviceStatus(created.deviceId, 'offline');
    return created;
  }

  async updateStatus(
    deviceId: string,
    status: 'online' | 'offline',
  ): Promise<void> {
    await this.databaseService.updateDeviceStatus(deviceId, status);
    this.websocketGateway.broadcastDeviceStatus(deviceId, status);
  }
}
