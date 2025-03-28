import { UsersRepository } from '../users.repository';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
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
