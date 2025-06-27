import { Controller, Get, Query } from '@nestjs/common';
import { UsersRepo } from '../user-accounts/infrastructure/users.repo';
import { DeviceAuthSessionsRepo } from '../user-accounts/infrastructure/device-auth-sessions.repo';
import { DeviceAuthSessionsQueryRepo } from '../user-accounts/infrastructure/query/device-auth-sessions.query-repo';
import { UsersQueryRepo } from '../user-accounts/infrastructure/query/users.query-repo';
import { GetUsersQueryParams } from '../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Post } from '../blogger-platform/posts/domain/post.entity';

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
