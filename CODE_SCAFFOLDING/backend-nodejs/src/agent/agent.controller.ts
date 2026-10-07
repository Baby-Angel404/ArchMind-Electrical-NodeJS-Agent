import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  AnalyzeArchitectureDto,
  AgentAnalysisResponse,
} from '../common/dto/agent.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('api/agent')
@UseGuards(ApiKeyGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('analyze')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  analyze(@Body() dto: AnalyzeArchitectureDto): AgentAnalysisResponse {
    return this.agentService.analyzeArchitecture(dto);
  }
}
