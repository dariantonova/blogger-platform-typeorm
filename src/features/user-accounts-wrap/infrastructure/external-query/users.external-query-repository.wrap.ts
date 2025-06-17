import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersQueryRepositoryWrap } from '../query/users.query-repository.wrap';
import { UserExternalDto } from '../../../user-accounts/infrastructure/external-query/external-dto/users.external-dto';

@Injectable()
export class UsersExternalQueryRepositoryWrap {
  constructor(private usersQueryRepository: UsersQueryRepositoryWrap) {}

  async findByIdOrInternalFail(userId: number): Promise<UserExternalDto> {
    const user = await this.usersQueryRepository.findById(userId);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return UserExternalDto.mapToViewWrap(user);
  }
}
