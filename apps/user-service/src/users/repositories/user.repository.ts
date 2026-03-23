import { Injectable } from '@nestjs/common';
import { TypeOrmUnitOfWork } from '@shared/common';
import { CatchUniqueViolation } from '../../decorators/catch-unique-violation.decorator';
import { User } from '../entities/user.entity';
import type { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly uow: TypeOrmUnitOfWork) {}

  @CatchUniqueViolation('User with this name already exists')
  create(data: Pick<User, 'name'>): Promise<User> {
    return this.uow.getManager().save(User, data);
  }
}
