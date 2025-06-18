import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuthQueryRepository } from '../../infrastructure/query/auth.query-repository';
import { MeViewDto } from '../../api/view-dto/user.view-dto';

export class MeQuery {
  constructor(public userId: number) {}
}

@QueryHandler(MeQuery)
export class MeQueryHandler implements IQueryHandler<MeQuery, MeViewDto> {
  constructor(private authQueryRepository: AuthQueryRepository) {}

  async execute({ userId }: MeQuery): Promise<MeViewDto> {
    return this.authQueryRepository.me(userId);
  }
}
