import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../../user-accounts/application/crypto.service';
import { UserAccountsConfig } from '../../../user-accounts/user-accounts.config';
import { randomBytes } from 'node:crypto';
import { PasswordRecoveryRequestedEvent } from '../../../user-accounts/domain/events/password-recovery-requested.event';
import { UsersRepositorySql } from '../../infrastructure/users.repository.sql';
import { add } from 'date-fns';

export class RecoverPasswordCommandSql {
  constructor(public email: string) {}
}

@CommandHandler(RecoverPasswordCommandSql)
export class RecoverPasswordUseCaseSql
  implements ICommandHandler<RecoverPasswordCommandSql>
{
  constructor(
    private usersRepository: UsersRepositorySql,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: RecoverPasswordCommandSql): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const recoveryCode = this.generateRecoveryCode();
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

    const expirationDate = add(new Date(), {
      seconds: this.userAccountsConfig.passwordRecoveryCodeLifetimeInSeconds,
    });

    await this.usersRepository.updateUserPasswordRecoveryCode(
      user.id,
      recoveryCodeHash,
      expirationDate,
    );

    this.eventBus.publish(
      new PasswordRecoveryRequestedEvent(user.email, recoveryCode),
    );
  }

  private generateRecoveryCode(): string {
    return randomBytes(32).toString('hex');
  }
}
