import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepositoryWrap } from '../../infrastructure/query/users.query-repository.wrap';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';

export class GetUserByIdOrInternalFailQueryWrap {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserByIdOrInternalFailQueryWrap)
export class GetUserByIdOrInternalFailQueryHandlerWrap
  implements IQueryHandler<GetUserByIdOrInternalFailQueryWrap, UserViewDto>
{
  constructor(private usersQueryRepository: UsersQueryRepositoryWrap) {}

  async execute({
    userId,
  }: GetUserByIdOrInternalFailQueryWrap): Promise<UserViewDto> {
    return this.usersQueryRepository.findByIdOrInternalFail(userId);
  }
}
