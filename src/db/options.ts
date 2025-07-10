import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DbConfig } from './db.config';

const dbConfig = new DbConfig();

export const options: DataSourceOptions = {
  type: 'postgres',
  host: dbConfig.pgHost,
  port: dbConfig.pgPort,
  username: dbConfig.pgUsername,
  password: dbConfig.pgPassword,
  database: dbConfig.pgDbName,
  synchronize: dbConfig.dbAutosync,
  logging: dbConfig.dbLogging,
  namingStrategy: new SnakeNamingStrategy(),
};
