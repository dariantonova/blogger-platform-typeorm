import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code';

export class ConfirmRegistrationCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private usersRepository: UsersRepo) {}

  async execute({
    confirmationCode,
  }: ConfirmRegistrationCommand): Promise<void> {
    const user =
      await this.usersRepository.findByConfirmationCode(confirmationCode);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
        extensions: [
          {
            field: 'code',
            message: 'Confirmation code is incorrect',
          },
        ],
      });
    }

    if (user.confirmationInfo.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
        extensions: [
          {
            field: 'code',
            message: 'Confirmation code has already been applied',
          },
        ],
      });
    }

    if (new Date() > user.confirmationInfo.expirationDate!) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
        extensions: [
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
