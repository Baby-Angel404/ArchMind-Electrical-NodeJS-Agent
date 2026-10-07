import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [TelemetryModule, DevicesModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
