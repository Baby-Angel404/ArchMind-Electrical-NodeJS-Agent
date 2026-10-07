import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { TelemetryService } from '../telemetry/telemetry.service';
import { DevicesService } from '../devices/devices.service';
import { IngestTelemetryDto } from '../common/dto/telemetry.dto';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null;

  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly devicesService: DevicesService,
  ) {}

  onModuleInit() {
    this.initializeMqtt();
  }

  onModuleDestroy() {
    if (this.client) {
      this.logger.log('Disconnecting MQTT client gracefully...');
      this.client.end(true);
    }
  }

  private initializeMqtt() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    const clientId = process.env.MQTT_CLIENT_ID || `archmind-backend-${Math.random().toString(16).substring(2, 10)}`;
    const telemetryTopic = process.env.MQTT_TOPIC_TELEMETRY || 'devices/+/telemetry';
    const statusTopic = 'devices/+/status';

    const options: mqtt.IClientOptions = {
      clientId,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 5000,
      rejectUnauthorized: process.env.MQTT_REJECT_UNAUTHORIZED === 'true',
    };

    if (process.env.MQTT_USERNAME) {
      options.username = process.env.MQTT_USERNAME;
      options.password = process.env.MQTT_PASSWORD;
    }

    this.logger.log(`Initializing MQTT connection to: ${brokerUrl} (client: ${clientId})`);

    try {
      this.client = mqtt.connect(brokerUrl, options);

      this.client.on('connect', () => {
        this.logger.log('MQTT client connected successfully to broker.');
        this.client.subscribe([telemetryTopic, statusTopic], { qos: 1 }, (err) => {
          if (err) {
            this.logger.error(`Failed to subscribe to MQTT topics: ${err.message}`);
          } else {
            this.logger.log(`Subscribed to MQTT topics: ${telemetryTopic}, ${statusTopic}`);
          }
        });
      });

      this.client.on('message', async (topic: string, message: Buffer) => {
        try {
          await this.handleIncomingMessage(topic, message.toString());
        } catch (err) {
          this.logger.error(`Error processing MQTT message on ${topic}: ${err.message}`);
        }
      });

      this.client.on('error', (err) => {
        // Log without crashing, so backend continues operating if broker is down
        this.logger.warn(`MQTT broker communication notice: ${err.message}`);
      });

      this.client.on('reconnect', () => {
        this.logger.log('Reconnecting to MQTT broker...');
      });
    } catch (err) {
      this.logger.warn(`Could not establish immediate MQTT connection: ${err.message}`);
    }
  }

  async handleIncomingMessage(topic: string, payloadStr: string) {
    let payload: any;
    try {
      payload = JSON.parse(payloadStr);
    } catch (e) {
      this.logger.warn(`Discarding malformed JSON payload on topic: ${topic}`);
      return;
    }

    if (topic.endsWith('/telemetry')) {
      const dto = new IngestTelemetryDto();
      dto.deviceId = payload.deviceId;
      dto.timestamp = payload.timestamp || new Date().toISOString();
      dto.voltage = typeof payload.voltage === 'number' ? payload.voltage : undefined;
      dto.current = typeof payload.current === 'number' ? payload.current : undefined;
      dto.power = typeof payload.power === 'number' ? payload.power : undefined;
      dto.temperature = typeof payload.temperature === 'number' ? payload.temperature : undefined;
      dto.frequency = typeof payload.frequency === 'number' ? payload.frequency : undefined;
      dto.powerFactor = typeof payload.powerFactor === 'number' ? payload.powerFactor : undefined;

      if (!dto.deviceId) {
        this.logger.warn(`Discarding telemetry missing deviceId on topic: ${topic}`);
        return;
      }

      await this.telemetryService.processTelemetry(dto);
    } else if (topic.endsWith('/status')) {
      const deviceId = payload.deviceId;
      const status = payload.status === 'online' ? 'online' : 'offline';
      if (deviceId) {
        await this.devicesService.updateStatus(deviceId, status);
      }
    }
  }

  publishCommand(deviceId: string, command: Record<string, any>): boolean {
    if (!this.client || !this.client.connected) {
      this.logger.warn(`Cannot publish command: MQTT client disconnected.`);
      return false;
    }
    const topic = `devices/${deviceId}/commands`;
    this.client.publish(topic, JSON.stringify(command), { qos: 1 });
    this.logger.log(`Published command to ${topic}: ${JSON.stringify(command)}`);
    return true;
  }
}
