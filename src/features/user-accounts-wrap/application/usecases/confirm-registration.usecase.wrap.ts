import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';

export class ConfirmRegistrationCommandWrap {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmRegistrationCommandWrap)
export class ConfirmRegistrationUseCaseWrap
  implements ICommandHandler<ConfirmRegistrationCommandWrap>
{
  constructor(private usersRepository: UsersRepositoryWrap) {}

  async execute({
    confirmationCode,
  }: ConfirmRegistrationCommandWrap): Promise<void> {
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

    if (new Date() > user.confirmationInfo.expirationDate!) {
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
