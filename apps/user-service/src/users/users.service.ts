import { Inject, Injectable } from '@nestjs/common';
import {
  AppLogger,
  AppMetrics,
  type IUnitOfWork,
  ScopedLogger,
  UNIT_OF_WORK,
} from '@shared/common';
import {
  OutboxEventType,
  RegisterUserDto,
  RegisterUserResponse,
} from '@shared/contracts';
import type { ITransactionalEventPublisher } from '../outbox/interfaces/transactional-event-publisher.interface';
import { TRANSACTIONAL_EVENT_PUBLISHER } from '../outbox/interfaces/transactional-event-publisher.interface';
import type { IUserRepository } from './interfaces/user-repository.interface';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import type { IUsersService } from './interfaces/users-service.interface';

@Injectable()
export class UsersService implements IUsersService {
  private readonly logger: ScopedLogger;

  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(TRANSACTIONAL_EVENT_PUBLISHER)
    private readonly eventPublisher: ITransactionalEventPublisher,
    logger: AppLogger,
    private readonly metrics: AppMetrics,
  ) {
    this.logger = logger.withContext(UsersService.name);
  }

  async register(data: RegisterUserDto): Promise<RegisterUserResponse> {
    const result = await this.uow.runInTransaction(async () => {
      const user = await this.userRepository.create({ name: data.name });

      await this.eventPublisher.publish(OutboxEventType.USER_REGISTERED, {
        userId: user.id,
        name: user.name,
      });

      return { id: user.id, name: user.name };
    });

    this.metrics.registrationsTotal.add(1);
    this.logger.log('User registered', {
      userId: result.id,
      name: result.name,
    });
    return result;
  }
}
