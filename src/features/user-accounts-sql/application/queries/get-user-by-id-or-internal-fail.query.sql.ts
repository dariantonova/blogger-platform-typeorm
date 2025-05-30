import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepositorySql } from '../../infrastructure/query/users.query-repository.sql';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';

export class GetUserByIdOrInternalFailQuerySql {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserByIdOrInternalFailQuerySql)
export class GetUserByIdOrInternalFailQueryHandlerSql
  implements IQueryHandler<GetUserByIdOrInternalFailQuerySql, UserViewDto>
{
  constructor(private usersQueryRepository: UsersQueryRepositorySql) {}

  async execute({
    userId,
  }: GetUserByIdOrInternalFailQuerySql): Promise<UserViewDto> {
    return this.usersQueryRepository.findByIdOrInternalFail(userId);
  }
}
