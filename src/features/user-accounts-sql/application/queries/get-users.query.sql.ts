import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UsersQueryRepositorySql } from '../../infrastructure/query/users.query-repository.sql';
import { GetUsersQueryParams } from '../../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';

export class GetUsersQuerySql {
  constructor(public queryParams: GetUsersQueryParams) {}
}

@QueryHandler(GetUsersQuerySql)
export class GetUsersQueryHandlerSql
  implements IQueryHandler<GetUsersQuerySql, PaginatedViewDto<UserViewDto[]>>
{
  constructor(private usersQueryRepository: UsersQueryRepositorySql) {}

  async execute({
    queryParams,
  }: GetUsersQuerySql): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.findUsers(queryParams);
  }
}
