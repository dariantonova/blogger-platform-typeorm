import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';

export class GetUsersQuery {
  constructor(public queryParams: GetUsersQueryParams) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler
  implements IQueryHandler<GetUsersQuery, PaginatedViewDto<UserViewDto[]>>
{
  constructor(private usersQueryRepository: UsersQueryRepo) {}

  async execute({
    queryParams,
  }: GetUsersQuery): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.findUsers(queryParams);
  }
}
