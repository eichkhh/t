import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { AppLogger } from '@shared/common';
import { RegisterUserDto, RegisterUserResponse } from '@shared/contracts';
import { firstValueFrom, type Observable } from 'rxjs';

interface IUserServiceGrpc {
  register(data: RegisterUserDto): Observable<RegisterUserResponse>;
}

@Controller({ path: 'users', version: '1' })
export class UsersController implements OnModuleInit {
  private userService!: IUserServiceGrpc;

  constructor(
    @Inject('USER_SERVICE_GRPC') private readonly client: ClientGrpc,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.userService = this.client.getService<IUserServiceGrpc>('UserService');
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto): Promise<RegisterUserResponse> {
    this.logger.log('Register request', { name: body.name });

    const result = await firstValueFrom(this.userService.register(body));

    this.logger.log('Register success', {
      userId: result.id,
      name: result.name,
    });
    return result;
  }
}
