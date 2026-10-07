import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from '../common/dto/device.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('api/devices')
@UseGuards(ApiKeyGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async getDevices() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  async getDevice(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerDevice(@Body() dto: CreateDeviceDto) {
    return this.devicesService.create(dto);
  }
}
