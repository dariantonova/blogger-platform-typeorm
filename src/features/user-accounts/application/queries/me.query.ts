import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { AuthQueryRepository } from '../../infrastructure/query/auth.query-repository';

export class MeQuery {
  constructor(public userId: string) {}
}

@QueryHandler(MeQuery)
export class MeQueryHandler implements IQueryHandler<MeQuery, MeViewDto> {
  constructor(private authQueryRepository: AuthQueryRepository) {}

  async execute({ userId }: MeQuery): Promise<MeViewDto> {
    return this.authQueryRepository.me(userId);
  }
}
