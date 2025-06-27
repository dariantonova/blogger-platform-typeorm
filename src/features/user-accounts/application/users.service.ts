import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserAccountsConfig } from '../user-accounts.config';
import { UsersRepo } from '../infrastructure/users.repo';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepo,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async updateUserConfirmationCode(user: User): Promise<string> {
    const confirmationCode = randomUUID();
    user.setConfirmationCode(
      confirmationCode,
      this.userAccountsConfig.emailConfirmationCodeLifetimeInSeconds,
    );

    await this.usersRepository.save(user);

    return confirmationCode;
  }
}
