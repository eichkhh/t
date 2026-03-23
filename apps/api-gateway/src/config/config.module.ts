import { Module } from '@nestjs/common';
import { ApiGatewayConfigService } from './api-gateway-config.service';

@Module({
  providers: [ApiGatewayConfigService],
  exports: [ApiGatewayConfigService],
})
export class ApiGatewayConfigModule {}
