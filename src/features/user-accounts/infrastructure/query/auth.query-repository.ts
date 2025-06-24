import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepository } from './users.query-repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async me(userId: number): Promise<MeViewDto> {
    const user = await this.usersQueryRepository.findById(userId);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return MeViewDto.mapToView(user);
  }
}
