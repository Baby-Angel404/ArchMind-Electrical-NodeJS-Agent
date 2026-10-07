import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { AnalyzeArchitectureDto } from '../common/dto/agent.dto';

describe('AgentService', () => {
  let service: AgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentService],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should identify high linear regulator dissipation risks', () => {
    const dto: AnalyzeArchitectureDto = {
      task: 'Evaluate 12V to 3.3V power converter for ESP32',
      context: {
        hardware: [
          { component: 'LDO Linear Regulator', vin: 12.0, vout: 3.3, current: 0.4 },
        ],
        firmware: [
          { mcu: 'ESP32', rtos: 'FreeRTOS' },
        ],
        requirements: [
          { maxAmbientTemp: 50.0 },
        ],
      },
    };

    const response = service.analyzeArchitecture(dto);
    expect(response.risks.some((r) => r.includes('linear dissipation risk'))).toBe(true);
    expect(response.recommendations.some((r) => r.includes('buck converter'))).toBe(true);
    expect(response.confidence).toBeGreaterThan(0.7);
  });

  it('should detect mains AC isolation requirement', () => {
    const dto: AnalyzeArchitectureDto = {
      task: 'Review 230V AC energy meter design',
      context: {
        requirements: [
          { description: 'Measure 230V AC mains line directly' },
        ],
      },
    };

    const response = service.analyzeArchitecture(dto);
    expect(response.risks.some((r) => r.includes('Mains voltage safety hazard'))).toBe(true);
    expect(response.recommendations.some((r) => r.includes('optoisolators'))).toBe(true);
  });
});
