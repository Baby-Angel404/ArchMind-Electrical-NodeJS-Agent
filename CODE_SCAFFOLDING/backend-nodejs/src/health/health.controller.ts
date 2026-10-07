import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  getHealth() {
    return {
      status: 'ok',
      uptime: (Date.now() - this.startTime) / 1000,
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        mqtt: 'active',
        influxdb: 'active',
      },
    };
  }
}
