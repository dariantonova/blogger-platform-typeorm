import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserAccountsConfig } from '../../user-accounts/user-accounts.config';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
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
