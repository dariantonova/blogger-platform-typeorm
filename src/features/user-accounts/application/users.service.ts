import { UsersRepository } from '../infrastructure/users.repository';
import { UserDocument } from '../domain/user.entity';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserAccountsConfig } from '../user-accounts.config';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async updateUserConfirmationCode(user: UserDocument): Promise<string> {
    const confirmationCode = randomUUID();
    user.setConfirmationCode(
      confirmationCode,
      this.userAccountsConfig.emailConfirmationCodeLifetimeInSeconds,
    );

    await this.usersRepository.save(user);

    return confirmationCode;
  }
}
