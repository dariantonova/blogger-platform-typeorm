import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepositorySql } from '../../infrastructure/users.repository.sql';

export class ConfirmRegistrationCommandSql {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmRegistrationCommandSql)
export class ConfirmRegistrationUseCaseSql
  implements ICommandHandler<ConfirmRegistrationCommandSql>
{
  constructor(private usersRepository: UsersRepositorySql) {}

  async execute({
    confirmationCode,
  }: ConfirmRegistrationCommandSql): Promise<void> {
    const user =
      await this.usersRepository.findUserWithConfirmationByConfirmationCode(
        confirmationCode,
      );
    if (!user) {
      throw new BadRequestException({
        errors: [
          {
            field: 'code',
            message: 'Confirmation code is incorrect',
          },
        ],
      });
    }

    if (user.confirmationInfo.isConfirmed) {
      throw new BadRequestException({
        errors: [
          {
            field: 'code',
            message: 'Confirmation code has already been applied',
          },
        ],
      });
    }

    if (new Date() > user.confirmationInfo.expirationDate) {
      throw new BadRequestException({
        errors: [
          {
            field: 'code',
            message: 'Confirmation code is expired',
          },
        ],
      });
    }

    await this.usersRepository.markUserAsConfirmed(user.id);
  }
}
