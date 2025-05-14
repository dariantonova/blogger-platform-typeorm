import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDtoSql } from '../../api/view-dto/users.view-dto.sql';
import { UsersQueryRepositorySql } from '../../infrastructure/query/users.query-repository.sql';
import { GetUsersQueryParams } from '../../../user-accounts/api/input-dto/get-users-query-params.input-dto';

export class GetUsersQuerySql {
  constructor(public queryParams: GetUsersQueryParams) {}
}

@QueryHandler(GetUsersQuerySql)
export class GetUsersQueryHandlerSql
  implements IQueryHandler<GetUsersQuerySql, PaginatedViewDto<UserViewDtoSql[]>>
{
  constructor(private usersQueryRepository: UsersQueryRepositorySql) {}

  async execute({
    queryParams,
  }: GetUsersQuerySql): Promise<PaginatedViewDto<UserViewDtoSql[]>> {
    return this.usersQueryRepository.findUsers(queryParams);
  }
}
