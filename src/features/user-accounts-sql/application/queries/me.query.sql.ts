import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDtoSql } from '../../api/view-dto/user.view-dto.sql';
import { AuthQueryRepositorySql } from '../../infrastructure/query/auth.query-repository.sql';

export class MeQuerySql {
  constructor(public userId: number) {}
}

@QueryHandler(MeQuerySql)
export class MeQueryHandlerSql
  implements IQueryHandler<MeQuerySql, MeViewDtoSql>
{
  constructor(private authQueryRepository: AuthQueryRepositorySql) {}

  async execute({ userId }: MeQuerySql): Promise<MeViewDtoSql> {
    return this.authQueryRepository.me(userId);
  }
}
