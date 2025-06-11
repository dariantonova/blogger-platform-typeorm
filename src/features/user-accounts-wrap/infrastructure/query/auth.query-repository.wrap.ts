import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MeViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';
import { UsersQueryRepositoryWrap } from './users.query-repository.wrap';

@Injectable()
export class AuthQueryRepositoryWrap {
  constructor(private usersQueryRepository: UsersQueryRepositoryWrap) {}

  async me(userId: string): Promise<MeViewDto> {
    const user = await this.usersQueryRepository.findById(userId);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return MeViewDto.mapToViewWrap(user);
  }
}
