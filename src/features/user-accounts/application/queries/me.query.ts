import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';

export class MeQuery {
  constructor(public userId: number) {}
}

@QueryHandler(MeQuery)
export class MeQueryHandler implements IQueryHandler<MeQuery, MeViewDto> {
  constructor(private usersQueryRepository: UsersQueryRepo) {}

  async execute({ userId }: MeQuery): Promise<MeViewDto> {
    return this.usersQueryRepository.me(userId);
  }
}
