import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepositorySql } from '../../infrastructure/query/users.query-repository.sql';
import { UserViewDtoSql } from '../../api/view-dto/user.view-dto.sql';

export class GetUserByIdOrInternalFailQuerySql {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserByIdOrInternalFailQuerySql)
export class GetUserByIdOrInternalFailQueryHandlerSql
  implements IQueryHandler<GetUserByIdOrInternalFailQuerySql, UserViewDtoSql>
{
  constructor(private usersQueryRepository: UsersQueryRepositorySql) {}

  async execute({
    userId,
  }: GetUserByIdOrInternalFailQuerySql): Promise<UserViewDtoSql> {
    return this.usersQueryRepository.findByIdOrInternalFail(userId);
  }
}
