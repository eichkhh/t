import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, EntityManager } from 'typeorm';
import { IsolationLevel, IUnitOfWork } from './unit-of-work.interface';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  private readonly als = new AsyncLocalStorage<EntityManager>();

  constructor(private readonly dataSource: DataSource) {}

  runInTransaction<T>(
    work: () => Promise<T>,
    isolationLevel?: IsolationLevel,
  ): Promise<T> {
    const run = (em: EntityManager) => this.als.run(em, work);
    const source = this.als.getStore() ?? this.dataSource;

    if (isolationLevel) {
      return source.transaction(isolationLevel, run);
    }

    return source.transaction(run);
  }

  getManager(): EntityManager {
    return this.als.getStore() ?? this.dataSource.manager;
  }
}
