import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CryptoService } from '../crypto.service';
import { UsersRepo } from '../../infrastructure/users.repo';

export class SetNewPasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase
  implements ICommandHandler<SetNewPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepo,
    private cryptoService: CryptoService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: SetNewPasswordCommand): Promise<void> {
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

    const user =
      await this.usersRepository.findByPasswordRecoveryCodeHash(
        recoveryCodeHash,
      );
    if (!user) {
      throw new BadRequestException({
        errors: [
          {
            field: 'recoveryCode',
            message: 'Recovery code is incorrect',
          },
        ],
      });
    }

    if (new Date() > user.passwordRecoveryInfo!.expirationDate) {
      throw new BadRequestException({
        errors: [
          {
            field: 'recoveryCode',
            message: 'Recovery code is expired',
          },
        ],
      });
    }

    user.resetPasswordRecoveryInfo();
    await this.usersRepository.deletePasswordRecoveryByUserId(user.id);

    const newPasswordHash =
      await this.cryptoService.createPasswordHash(newPassword);

    user.setPasswordHash(newPasswordHash);

    await this.usersRepository.save(user);
  }
}
