import { Controller, Get, Query } from '@nestjs/common';
import { UsersRepo } from './infrastructure/user-accounts/users.repo';
import { DeviceAuthSessionsRepo } from './infrastructure/user-accounts/device-auth-sessions.repo';
import { DeviceAuthSessionsQueryRepo } from './infrastructure/user-accounts/query/device-auth-sessions.query-repo';
import { UsersQueryRepo } from './infrastructure/user-accounts/query/users.query-repo';
import { GetUsersQueryParams } from '../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from './entities/user-accounts/user.entity';

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
    return this.dataSource
      .createQueryBuilder()
      .from(User, 'u')
      .andWhere(`u.login ilike :login`, { login: '%user%' })
      .andWhere(`u.email ilike :email`, { email: '%user%' })
      .getRawMany();
  }
}
