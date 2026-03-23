export type IsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE';

export const UNIT_OF_WORK = Symbol('IUnitOfWork');

export interface IUnitOfWork {
  runInTransaction<T>(
    work: () => Promise<T>,
    isolationLevel?: IsolationLevel,
  ): Promise<T>;
  getManager(): import('typeorm').EntityManager;
}
