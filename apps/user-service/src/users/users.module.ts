import { Module } from '@nestjs/common';
import { OutboxModule } from '../outbox/outbox.module';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import { USERS_SERVICE } from './interfaces/users-service.interface';
import { UserRepository } from './repositories/user.repository';
import { UsersGrpcController } from './users-grpc.controller';
import { UsersService } from './users.service';

@Module({
  imports: [OutboxModule],
  controllers: [UsersGrpcController],
  providers: [
    UserRepository,
    { provide: USER_REPOSITORY, useExisting: UserRepository },
    UsersService,
    { provide: USERS_SERVICE, useExisting: UsersService },
  ],
  exports: [USERS_SERVICE],
})
export class UsersModule {}
