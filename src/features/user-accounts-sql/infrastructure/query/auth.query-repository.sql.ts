import { Injectable } from '@nestjs/common';
import { UsersRepositorySql } from '../users.repository.sql';
import { MeViewDtoSql } from '../../api/view-dto/users.view-dto.sql';

@Injectable()
export class AuthQueryRepositorySql {
  constructor(private usersRepository: UsersRepositorySql) {}

  async me(userId: number): Promise<MeViewDtoSql> {
    const user = await this.usersRepository.findByIdOrInternalFail(userId);

    return MeViewDtoSql.mapToView(user);
  }
}
