import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { WebsocketModule } from './websocket/websocket.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { DevicesModule } from './devices/devices.module';
import { MqttModule } from './mqtt/mqtt.module';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [
    HealthModule,
    DatabaseModule,
    WebsocketModule,
    TelemetryModule,
    DevicesModule,
    MqttModule,
    AgentModule,
  ],
})
export class AppModule {}
