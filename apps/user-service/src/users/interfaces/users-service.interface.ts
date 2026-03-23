import type { RegisterUserDto, RegisterUserResponse } from '@shared/contracts';

export const USERS_SERVICE = Symbol('IUsersService');

export interface IUsersService {
  register(data: RegisterUserDto): Promise<RegisterUserResponse>;
}
