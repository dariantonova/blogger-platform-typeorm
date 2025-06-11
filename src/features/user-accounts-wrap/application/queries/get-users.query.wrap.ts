import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UsersQueryRepositoryWrap } from '../../infrastructure/query/users.query-repository.wrap';
import { GetUsersQueryParams } from '../../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';

export class GetUsersQueryWrap {
  constructor(public queryParams: GetUsersQueryParams) {}
}

@QueryHandler(GetUsersQueryWrap)
export class GetUsersQueryHandlerWrap
  implements IQueryHandler<GetUsersQueryWrap, PaginatedViewDto<UserViewDto[]>>
{
  constructor(private usersQueryRepository: UsersQueryRepositoryWrap) {}

  async execute({
    queryParams,
  }: GetUsersQueryWrap): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.findUsers(queryParams);
  }
}
