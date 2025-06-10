import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomBytes } from 'node:crypto';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';
import { CryptoService } from '../../../user-accounts/application/crypto.service';
import { UserAccountsConfig } from '../../../user-accounts/user-accounts.config';
import { PasswordRecoveryRequestedEvent } from '../../../user-accounts/domain/events/password-recovery-requested.event';

export class RecoverPasswordCommandWrap {
  constructor(public email: string) {}
}

@CommandHandler(RecoverPasswordCommandWrap)
export class RecoverPasswordUseCaseWrap
  implements ICommandHandler<RecoverPasswordCommandWrap>
{
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: RecoverPasswordCommandWrap): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const recoveryCode = randomBytes(32).toString('hex');
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

    user.setPasswordRecoveryCodeHash(
      recoveryCodeHash,
      this.userAccountsConfig.passwordRecoveryCodeLifetimeInSeconds,
    );

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new PasswordRecoveryRequestedEvent(user.email, recoveryCode),
    );
  }
}
