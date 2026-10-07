import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class IngestTelemetryDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(600)
  voltage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  current?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  power?: number;

  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(150)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(70)
  frequency?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  powerFactor?: number;
}
