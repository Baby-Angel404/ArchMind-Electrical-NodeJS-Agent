import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { IngestTelemetryDto } from '../common/dto/telemetry.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('api/telemetry')
@UseGuards(ApiKeyGuard)
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get(':deviceId')
  async getTelemetry(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.telemetryService.getRecent(deviceId, parsedLimit);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async ingestHttpTelemetry(@Body() dto: IngestTelemetryDto) {
    return this.telemetryService.processTelemetry(dto);
  }
}
