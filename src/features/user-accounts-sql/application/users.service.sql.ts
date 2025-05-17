import { Injectable } from '@nestjs/common';
import { UserAccountsConfig } from '../../user-accounts/user-accounts.config';
import { randomUUID } from 'node:crypto';
import { UsersRepositorySql } from '../infrastructure/users.repository.sql';
import { add } from 'date-fns';

@Injectable()
export class UsersServiceSql {
  constructor(
    private usersRepository: UsersRepositorySql,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async updateUserConfirmationCode(userId: number): Promise<string> {
    const confirmationCode = randomUUID();
    const expirationDate = add(new Date(), {
      seconds: this.userAccountsConfig.emailConfirmationCodeLifetimeInSeconds,
    });

    await this.usersRepository.updateUserConfirmationCode(
      userId,
      confirmationCode,
      expirationDate,
    );

    return confirmationCode;
  }
}
