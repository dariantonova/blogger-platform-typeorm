import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from '../../api/view-dto/user.view-dto';
import { AuthQueryRepo } from '../../infrastructure/query/auth.query-repo';

export class MeQuery {
  constructor(public userId: number) {}
}

@QueryHandler(MeQuery)
export class MeQueryHandler implements IQueryHandler<MeQuery, MeViewDto> {
  constructor(private authQueryRepository: AuthQueryRepo) {}

  async execute({ userId }: MeQuery): Promise<MeViewDto> {
    return this.authQueryRepository.me(userId);
  }
}
