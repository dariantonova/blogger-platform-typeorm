import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersQueryRepo } from './users.query-repo';
import { MeViewDto } from '../../../../user-accounts/api/view-dto/user.view-dto';

@Injectable()
export class AuthQueryRepo {
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async me(userId: number): Promise<MeViewDto> {
    const user = await this.usersQueryRepo.findById(userId);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return MeViewDto.mapToViewEntity(user);
  }
}
