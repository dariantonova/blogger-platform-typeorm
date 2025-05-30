import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuthQueryRepositorySql } from '../../infrastructure/query/auth.query-repository.sql';
import { MeViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';

export class MeQuerySql {
  constructor(public userId: number) {}
}

@QueryHandler(MeQuerySql)
export class MeQueryHandlerSql implements IQueryHandler<MeQuerySql, MeViewDto> {
  constructor(private authQueryRepository: AuthQueryRepositorySql) {}

  async execute({ userId }: MeQuerySql): Promise<MeViewDto> {
    return this.authQueryRepository.me(userId);
  }
}
