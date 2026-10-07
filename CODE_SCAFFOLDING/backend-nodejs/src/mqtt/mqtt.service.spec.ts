import { Test, TestingModule } from '@nestjs/testing';
import { MqttService } from './mqtt.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { DevicesService } from '../devices/devices.service';

describe('MqttService', () => {
  let service: MqttService;
  let telemetryService: TelemetryService;
  let devicesService: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MqttService,
        {
          provide: TelemetryService,
          useValue: {
            processTelemetry: jest.fn(),
          },
        },
        {
          provide: DevicesService,
          useValue: {
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MqttService>(MqttService);
    telemetryService = module.get<TelemetryService>(TelemetryService);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse valid telemetry JSON message and forward to TelemetryService', async () => {
    const topic = 'devices/esp32-001/telemetry';
    const payload = JSON.stringify({
      deviceId: 'esp32-001',
      voltage: 230.5,
      current: 4.8,
      temperature: 36.1,
    });

    await service.handleIncomingMessage(topic, payload);
    expect(telemetryService.processTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId: 'esp32-001',
        voltage: 230.5,
        current: 4.8,
        temperature: 36.1,
      }),
    );
  });

  it('should safely handle and discard malformed JSON without throwing', async () => {
    const topic = 'devices/esp32-001/telemetry';
    const malformed = '{ invalid json payload :(';

    await expect(service.handleIncomingMessage(topic, malformed)).resolves.not.toThrow();
    expect(telemetryService.processTelemetry).not.toHaveBeenCalled();
  });

  it('should update device status upon LWT status topic message', async () => {
    const topic = 'devices/esp32-001/status';
    const payload = JSON.stringify({
      deviceId: 'esp32-001',
      status: 'offline',
    });

    await service.handleIncomingMessage(topic, payload);
    expect(devicesService.updateStatus).toHaveBeenCalledWith('esp32-001', 'offline');
  });
});
