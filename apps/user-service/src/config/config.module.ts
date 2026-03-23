import { Module } from '@nestjs/common';
import { UserServiceConfigService } from './user-service-config.service';

@Module({
  providers: [UserServiceConfigService],
  exports: [UserServiceConfigService],
})
export class UserServiceConfigModule {}
