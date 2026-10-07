import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsArray,
} from 'class-validator';

export class AgentContextDto {
  @IsOptional()
  @IsArray()
  hardware?: any[];

  @IsOptional()
  @IsArray()
  firmware?: any[];

  @IsOptional()
  @IsArray()
  backend?: any[];

  @IsOptional()
  @IsArray()
  requirements?: any[];
}

export class AnalyzeArchitectureDto {
  @IsString()
  @IsNotEmpty()
  task: string;

  @IsObject()
  @IsNotEmpty()
  context: AgentContextDto;
}

export interface AgentAnalysisResponse {
  summary: string;
  architecture: string[];
  risks: string[];
  recommendations: string[];
  tests: string[];
  confidence: number;
}
