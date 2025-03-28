import { UsersRepository } from '../users.repository';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { InternalServerErrorException } from '@nestjs/common';

export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(userId: string): Promise<MeViewDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }
    return MeViewDto.mapToView(user);
  }
}
