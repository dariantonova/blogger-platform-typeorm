import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';

export class GetUserByIdOrInternalFailQuery {
  constructor(public userId: string) {}
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
