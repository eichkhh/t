import 'reflect-metadata';
import { join } from 'path';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'test',
  password: process.env.POSTGRES_PASSWORD ?? 'test',
  database: process.env.POSTGRES_DB ?? 'users',
  entities: [join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'src', 'migrations', '*.{ts,js}')],
  synchronize: false,
});

export default AppDataSource;
