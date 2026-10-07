import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  hardwareModel: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  firmwareVersion: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  location?: string;
}
