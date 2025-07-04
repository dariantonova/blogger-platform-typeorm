import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomBytes } from 'node:crypto';
import { CryptoService } from '../crypto.service';
import { UserAccountsConfig } from '../../user-accounts.config';
import { PasswordRecoveryRequestedEvent } from '../events/password-recovery-requested.event';
import { UsersRepo } from '../../infrastructure/users.repo';

export class RecoverPasswordCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase
  implements ICommandHandler<RecoverPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepo,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: RecoverPasswordCommand): Promise<void> {
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
