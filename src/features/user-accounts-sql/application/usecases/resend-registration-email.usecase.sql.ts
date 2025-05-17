import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { ConfirmationEmailResendRequestedEvent } from '../../../user-accounts/domain/events/confirmation-email-resend-requested.event';
import { UsersRepositorySql } from '../../infrastructure/users.repository.sql';
import { UsersServiceSql } from '../users.service.sql';

export class ResendRegistrationEmailCommandSql {
  constructor(public email: string) {}
}

@CommandHandler(ResendRegistrationEmailCommandSql)
export class ResendRegistrationEmailUseCaseSql
  implements ICommandHandler<ResendRegistrationEmailCommandSql>
{
  constructor(
    private usersRepository: UsersRepositorySql,
    private usersService: UsersServiceSql,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: ResendRegistrationEmailCommandSql): Promise<void> {
    const userWithConfirmation =
      await this.usersRepository.findUserWithConfirmationByEmail(email);

    if (!userWithConfirmation) {
      throw new BadRequestException({
        errors: [
          {
            field: 'email',
            message: 'User with specified email does not exist',
          },
        ],
      });
    }

    if (userWithConfirmation.confirmationInfo.isConfirmed) {
      throw new BadRequestException({
        errors: [
          {
            field: 'email',
            message: 'User is already confirmed',
          },
        ],
      });
    }

    const newConfirmationCode =
      await this.usersService.updateUserConfirmationCode(
        userWithConfirmation.id,
      );

    this.eventBus.publish(
      new ConfirmationEmailResendRequestedEvent(email, newConfirmationCode),
    );
  }
}
