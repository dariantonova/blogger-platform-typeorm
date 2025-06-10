import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UsersRepositoryWrap } from '../infrastructure/users.repository.wrap';
import { UserAccountsConfig } from '../../user-accounts/user-accounts.config';
import { UserWrap } from '../domain/user.wrap';

@Injectable()
export class UsersServiceWrap {
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async updateUserConfirmationCode(user: UserWrap): Promise<string> {
    const confirmationCode = randomUUID();
    user.setConfirmationCode(
      confirmationCode,
      this.userAccountsConfig.emailConfirmationCodeLifetimeInSeconds,
    );

    await this.usersRepository.save(user);

    return confirmationCode;
  }
}
