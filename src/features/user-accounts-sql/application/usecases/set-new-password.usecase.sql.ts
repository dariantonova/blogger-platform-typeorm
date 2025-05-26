import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../../user-accounts/application/crypto.service';
import { BadRequestException } from '@nestjs/common';
import { UsersRepositorySql } from '../../infrastructure/users.repository.sql';

export class SetNewPasswordCommandSql {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SetNewPasswordCommandSql)
export class SetNewPasswordUseCaseSql
  implements ICommandHandler<SetNewPasswordCommandSql>
{
  constructor(
    private usersRepository: UsersRepositorySql,
    private cryptoService: CryptoService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: SetNewPasswordCommandSql): Promise<void> {
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

    const user =
      await this.usersRepository.findUserWithPasswordRecoveryByRecoveryCodeHash(
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

    if (new Date() > user.passwordRecoveryInfo.expirationDate) {
      throw new BadRequestException({
        errors: [
          {
            field: 'recoveryCode',
            message: 'Recovery code is expired',
          },
        ],
      });
    }

    await this.usersRepository.hardDeleteUserPasswordRecovery(user.id);

    const newPasswordHash =
      await this.cryptoService.createPasswordHash(newPassword);

    await this.usersRepository.updateUserPasswordHash(user.id, newPasswordHash);
  }
}
