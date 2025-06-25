import { Controller, Get, Query } from '@nestjs/common';
import { UsersRepo } from './infrastructure/user-accounts/users.repo';
import { DeviceAuthSessionsRepo } from './infrastructure/user-accounts/device-auth-sessions.repo';
import { DeviceAuthSessionsQueryRepo } from './infrastructure/user-accounts/query/device-auth-sessions.query-repo';
import { UsersQueryRepo } from './infrastructure/user-accounts/query/users.query-repo';
import { GetUsersQueryParams } from '../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Post } from './entities/blogger-platform/post.entity';

@Controller('pg')
export class PgController {
  constructor(
    private usersRepo: UsersRepo,
    private deviceAuthSessionsRepo: DeviceAuthSessionsRepo,
    private usersQueryRepo: UsersQueryRepo,
    private deviceAuthSessionsQueryRepo: DeviceAuthSessionsQueryRepo,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  async getUsers(@Query() query: GetUsersQueryParams): Promise<any> {
    const paginatedPostsCteQB = this.dataSource
      .createQueryBuilder()
      .select([
        'p.id',
        'p.title',
        'p.short_description',
        'p.content',
        'p.created_at',
        'p.blog_id',
        'b.name as blog_name',
      ])
      .from(Post, 'p')
      .leftJoin('p.blog', 'b');

    const result = await paginatedPostsCteQB.getRawMany();
    console.log(result);
  }
}
