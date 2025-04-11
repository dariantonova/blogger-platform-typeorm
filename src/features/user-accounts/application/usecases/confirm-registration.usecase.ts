import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

export class ConfirmRegistrationCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    confirmationCode,
  }: ConfirmRegistrationCommand): Promise<void> {
    const user =
      await this.usersRepository.findByConfirmationCode(confirmationCode);
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

    user.makeConfirmed();

    await this.usersRepository.save(user);
  }
}
