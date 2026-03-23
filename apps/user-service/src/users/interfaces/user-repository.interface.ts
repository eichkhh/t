import type { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
  create(data: Pick<User, 'name'>): Promise<User>;
}
