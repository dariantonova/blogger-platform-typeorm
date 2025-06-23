import { Controller, Get, Query } from '@nestjs/common';
import { UsersRepo } from './infrastructure/user-accounts/users.repo';
import { DeviceAuthSessionsRepo } from './infrastructure/user-accounts/device-auth-sessions.repo';
import { DeviceAuthSessionsQueryRepo } from './infrastructure/user-accounts/query/device-auth-sessions.query-repo';
import { UsersQueryRepo } from './infrastructure/user-accounts/query/users.query-repo';
import { GetUsersQueryParams } from '../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../user-accounts/api/view-dto/user.view-dto';

@Controller('pg')
export class PgController {
  constructor(
    private usersRepo: UsersRepo,
    private deviceAuthSessionsRepo: DeviceAuthSessionsRepo,
    private usersQueryRepo: UsersQueryRepo,
    private deviceAuthSessionsQueryRepo: DeviceAuthSessionsQueryRepo,
  ) {}

  @Get()
  async getUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const users = await this.usersQueryRepo.findUsers(query);
    return users;
  }
}
