import { QueryFailedError } from 'typeorm';
import { AlreadyExistsException } from '../users/exceptions/already-exists.exception';

const PG_UNIQUE_VIOLATION = '23505';

type AsyncMethod = (...args: unknown[]) => Promise<unknown>;

export function CatchUniqueViolation(message: string): MethodDecorator {
  return (_target, _key, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as AsyncMethod;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await original.apply(this, args);
      } catch (err) {
        if (
          err instanceof QueryFailedError &&
          (err as QueryFailedError & { code?: string }).code ===
            PG_UNIQUE_VIOLATION
        ) {
          throw new AlreadyExistsException(message);
        }
        throw err;
      }
    };

    return descriptor;
  };
}
