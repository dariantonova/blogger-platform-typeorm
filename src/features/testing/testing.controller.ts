import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private databaseConnection: Connection,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll(): Promise<void> {
    const collections = await this.databaseConnection.listCollections();

    const promises = collections.map((collection) =>
      this.databaseConnection.collection(collection.name).deleteMany({}),
    );
    await Promise.all(promises);

    await this.deleteAllDataFromSqlTables();
  }

  private async deleteAllDataFromSqlTables(): Promise<void> {
    const tables: { tablename: string }[] = await this.dataSource.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public';
    `);
    const tableNames = tables.map((t) => `"${t.tablename}"`).join(', ');

    await this.dataSource.query(`
    TRUNCATE TABLE ${tableNames} 
    RESTART IDENTITY CASCADE;
    `);
  }
}
