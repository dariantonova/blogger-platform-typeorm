import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';
import { CryptoService } from '../../../user-accounts/application/crypto.service';

export class SetNewPasswordCommandWrap {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SetNewPasswordCommandWrap)
export class SetNewPasswordUseCaseWrap
  implements ICommandHandler<SetNewPasswordCommandWrap>
{
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private cryptoService: CryptoService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: SetNewPasswordCommandWrap): Promise<void> {
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

    const newPasswordHash =
      await this.cryptoService.createPasswordHash(newPassword);

    user.setPasswordHash(newPasswordHash);

    await this.usersRepository.save(user);
  }
}
