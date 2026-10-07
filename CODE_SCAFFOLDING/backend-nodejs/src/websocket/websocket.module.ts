import { Module } from '@nestjs/common';
import { TelemetryWebsocketGateway } from './websocket.gateway';

@Module({
  providers: [TelemetryWebsocketGateway],
  exports: [TelemetryWebsocketGateway],
})
export class WebsocketModule {}
