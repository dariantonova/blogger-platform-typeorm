import { Injectable } from '@nestjs/common';
import { UserExternalDtoSql } from './external-dto/users.external-dto.sql';
import { UsersRepositorySql } from '../users.repository.sql';

@Injectable()
export class UsersExternalQueryRepositorySql {
  constructor(private usersRepository: UsersRepositorySql) {}

  async findByIdOrInternalFail(id: number): Promise<UserExternalDtoSql> {
    const user = await this.usersRepository.findByIdOrInternalFail(id);

    return UserExternalDtoSql.mapToView(user);
  }
}
