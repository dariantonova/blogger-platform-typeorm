import { Injectable } from '@nestjs/common';
import { UsersRepositorySql } from '../users.repository.sql';
import { MeViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';

@Injectable()
export class AuthQueryRepositorySql {
  constructor(private usersRepository: UsersRepositorySql) {}

  async me(userId: number): Promise<MeViewDto> {
    const user = await this.usersRepository.findByIdOrInternalFail(userId);

    return MeViewDto.mapToView(user);
  }
}
