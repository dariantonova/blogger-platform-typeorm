import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';

export class GetUserByIdOrInternalFailQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserByIdOrInternalFailQuery)
export class GetUserByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetUserByIdOrInternalFailQuery, UserViewDto>
{
  constructor(private usersQueryRepository: UsersQueryRepo) {}

  async execute({
    userId,
  }: GetUserByIdOrInternalFailQuery): Promise<UserViewDto> {
    return this.usersQueryRepository.findByIdOrInternalFail(userId);
  }
}
