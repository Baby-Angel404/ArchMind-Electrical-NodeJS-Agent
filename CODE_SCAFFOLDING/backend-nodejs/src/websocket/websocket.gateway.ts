import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { TelemetryMessage } from '../common/interfaces/telemetry.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TelemetryWebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TelemetryWebsocketGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`WebSocket client connected: ${client.id}`);
    this.broadcastDeviceEvent('device:connected', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WebSocket client disconnected: ${client.id}`);
    this.broadcastDeviceEvent('device:disconnected', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { reply: 'pong', timestamp: new Date().toISOString() });
  }

  broadcastTelemetry(telemetry: TelemetryMessage) {
    if (this.server) {
      this.server.emit('telemetry:update', telemetry);
    }
  }

  broadcastDeviceStatus(deviceId: string, status: 'online' | 'offline') {
    if (this.server) {
      this.server.emit('device:status', {
        deviceId,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  broadcastDeviceEvent(
    event: 'device:connected' | 'device:disconnected',
    payload: any,
  ) {
    if (this.server) {
      this.server.emit(event, payload);
    }
  }
}
