import { config } from 'dotenv';
import { envFilePaths } from '../env-file-paths';
config({
  path: envFilePaths,
});
import { options } from './options';
import { DataSource, DataSourceOptions } from 'typeorm';

const migrationOptions = {
  ...options,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
} as DataSourceOptions;

export default new DataSource(migrationOptions);
