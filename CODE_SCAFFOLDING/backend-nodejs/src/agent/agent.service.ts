import { Injectable, Logger } from '@nestjs/common';
import { AnalyzeArchitectureDto, AgentAnalysisResponse } from '../common/dto/agent.dto';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  analyzeArchitecture(dto: AnalyzeArchitectureDto): AgentAnalysisResponse {
    this.logger.log(`Performing AI engineering architecture analysis for task: "${dto.task}"`);

    const hardware = dto.context?.hardware || [];
    const firmware = dto.context?.firmware || [];
    const backend = dto.context?.backend || [];
    const requirements = dto.context?.requirements || [];

    const architecture: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];
    const tests: string[] = [];

    let scoreFactors = 0;
    let totalFactors = 4;

    // 1. Hardware Analysis
    if (hardware.length > 0) {
      scoreFactors++;
      architecture.push('Segmented power domain architecture: 5V pre-regulated DC bus feeding low-noise 3.3V LDO for analog precision sensing.');
      
      const hasLdoHighVin = hardware.some((h) => (h.vin || 0) > 9.0 && (h.component || '').toLowerCase().includes('ldo'));
      if (hasLdoHighVin) {
        risks.push('Severe linear dissipation risk: LDO dropping >9V to 3.3V at Wi-Fi peak current (>300mA) exceeds passive SOT-223/TO-252 package thermal dissipation.');
        recommendations.push('Replace high-dropout linear regulator with synchronous buck converter (e.g. TI TPS54302 or Monolithic Power MP2315, >90% efficiency).');
      } else {
        recommendations.push('Derate all MLCC capacitors by at least 50% voltage rating to counteract DC bias capacitance degradation.');
      }
      tests.push('Perform 4-corner DC supply sweep (Vin_min, Vin_max, T_min, T_max) under 100% continuous load.');
    } else {
      recommendations.push('Specify transducer signal chain: ensure CT burden resistor power dissipation margin > 200%.');
    }

    // 2. Firmware Analysis
    if (firmware.length > 0) {
      scoreFactors++;
      architecture.push('Dual-core FreeRTOS allocation: Core 0 dedicated to Wi-Fi/TLS network stack; Core 1 dedicated to sensor sampling and ADC filtering.');
      risks.push('I2C bus lockup vulnerability: unhandled SDA line held low by peripheral during MCU reboot will hang initialization.');
      recommendations.push('Implement hardware Task Watchdog Timer (esp_task_wdt <= 15s) and 9-clock I2C bus recovery routine in setup.');
      tests.push('Execute simulated brownout and I2C disconnect fault injection to verify watchdog recovery within 3 seconds.');
    } else {
      recommendations.push('Integrate dual-partition OTA rollback architecture with cryptographic signature validation.');
    }

    // 3. Backend & Network Analysis
    if (backend.length > 0) {
      scoreFactors++;
      architecture.push('Event-driven microservice ingestion: MQTT TLS 1.3 broker feeding reactive NestJS streams with dual-persistence (PostgreSQL + InfluxDB).');
      recommendations.push('Enforce broker ACL topic isolation restricting device publishing strictly to devices/{deviceId}/telemetry.');
      tests.push('Run Apache Bench / Artillery soak test at 5,000 telemetry messages/sec to verify InfluxDB line-protocol write buffer stability.');
    } else {
      recommendations.push('Mandate TLS 1.3 on MQTT port 8883 with certificate verification enabled.');
    }

    // 4. Requirements & Safety Verification
    if (requirements.length > 0) {
      scoreFactors++;
      const requiresMains = requirements.some((r) => JSON.stringify(r).toLowerCase().includes('mains') || JSON.stringify(r).toLowerCase().includes('230v'));
      if (requiresMains) {
        risks.push('Mains voltage safety hazard: physical barrier creepage and clearance must meet IEC 61010-1 (min 6.0mm creepage for reinforced isolation).');
        recommendations.push('Incorporate optoisolators (Viso >= 3.75kVrms) or optical transducers (ZMPT101B) between mains AC and digital MCU domain.');
        tests.push('Conduct 3.75kV AC 1-minute hipot insulation withstand test before prototype bench testing.');
      }
    }

    // Meaningful confidence calculation based on context completeness
    const confidence = Math.min(0.99, Math.max(0.65, Number((scoreFactors / totalFactors * 0.35 + 0.60).toFixed(2))));

    const summary = `ArchMind Engineering Assessment for "${dto.task}": ${risks.length} critical architectural risks identified; ${recommendations.length} optimization countermeasures proposed across hardware, firmware, and cloud layers.`;

    return {
      summary,
      architecture,
      risks,
      recommendations,
      tests,
      confidence,
    };
  }
}
