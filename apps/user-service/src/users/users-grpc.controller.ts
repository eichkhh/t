import {
  Controller,
  Inject,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcServerCorrelationInterceptor } from '@shared/common';
import { RegisterUserDto, RegisterUserResponse } from '@shared/contracts';
import { TypeOrmRpcExceptionFilter } from '../filters/typeorm-rpc-exception.filter';
import type { IUsersService } from './interfaces/users-service.interface';
import { USERS_SERVICE } from './interfaces/users-service.interface';

@Controller()
@UseInterceptors(GrpcServerCorrelationInterceptor)
@UseFilters(TypeOrmRpcExceptionFilter)
export class UsersGrpcController {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: IUsersService,
  ) {}

  @GrpcMethod('UserService', 'Register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(data: RegisterUserDto): Promise<RegisterUserResponse> {
    return this.usersService.register(data);
  }
}
