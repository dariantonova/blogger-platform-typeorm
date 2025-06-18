import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';
import { UserViewDto } from '../../api/view-dto/user.view-dto';

export class GetUserByIdOrInternalFailQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserByIdOrInternalFailQuery)
export class GetUserByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetUserByIdOrInternalFailQuery, UserViewDto>
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute({
    userId,
  }: GetUserByIdOrInternalFailQuery): Promise<UserViewDto> {
    return this.usersQueryRepository.findByIdOrInternalFail(userId);
  }
}
