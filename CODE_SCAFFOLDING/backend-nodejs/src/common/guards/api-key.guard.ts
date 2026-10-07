import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const configuredKey = process.env.API_KEY;

    // In test or non-production mode without configured key, permit request
    if (!configuredKey || process.env.NODE_ENV === 'test') {
      return true;
    }

    const providedKey = request.headers['x-api-key'] || request.headers['authorization']?.replace('Bearer ', '');

    if (!providedKey || providedKey !== configuredKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
