import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryService } from './telemetry.service';
import { DatabaseService } from '../database/database.service';
import { TelemetryWebsocketGateway } from '../websocket/websocket.gateway';
import { IngestTelemetryDto } from '../common/dto/telemetry.dto';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let databaseService: DatabaseService;
  let websocketGateway: TelemetryWebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        DatabaseService,
        {
          provide: TelemetryWebsocketGateway,
          useValue: {
            broadcastTelemetry: jest.fn(),
            broadcastDeviceStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    websocketGateway = module.get<TelemetryWebsocketGateway>(
      TelemetryWebsocketGateway,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(databaseService).toBeDefined();
  });

  it('should process telemetry and calculate active power when missing', async () => {
    const dto: IngestTelemetryDto = {
      deviceId: 'esp32-unit-01',
      timestamp: '2026-10-08T04:20:00Z',
      voltage: 230.0,
      current: 5.0,
      powerFactor: 0.9,
    };

    const result = await service.processTelemetry(dto);
    expect(result.deviceId).toBe('esp32-unit-01');
    expect(result.power).toBeCloseTo(230.0 * 5.0 * 0.9);
    expect(websocketGateway.broadcastTelemetry).toHaveBeenCalledWith(result);
  });

  it('should retrieve recent telemetry records from database store', async () => {
    const dto: IngestTelemetryDto = {
      deviceId: 'esp32-history-test',
      timestamp: new Date().toISOString(),
      voltage: 231.2,
      current: 4.8,
    };
    await service.processTelemetry(dto);

    const history = await service.getRecent('esp32-history-test', 10);
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].deviceId).toBe('esp32-history-test');
  });
});
