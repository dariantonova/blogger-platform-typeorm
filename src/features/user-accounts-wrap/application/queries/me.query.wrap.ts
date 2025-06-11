import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuthQueryRepositoryWrap } from '../../infrastructure/query/auth.query-repository.wrap';
import { MeViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';

export class MeQueryWrap {
  constructor(public userId: string) {}
}

@QueryHandler(MeQueryWrap)
export class MeQueryHandlerWrap
  implements IQueryHandler<MeQueryWrap, MeViewDto>
{
  constructor(private authQueryRepository: AuthQueryRepositoryWrap) {}

  async execute({ userId }: MeQueryWrap): Promise<MeViewDto> {
    return this.authQueryRepository.me(userId);
  }
}
