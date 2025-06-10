import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';
import { UsersServiceWrap } from '../users.service.wrap';
import { ConfirmationEmailResendRequestedEvent } from '../../../user-accounts/domain/events/confirmation-email-resend-requested.event';

export class ResendRegistrationEmailCommandWrap {
  constructor(public email: string) {}
}

@CommandHandler(ResendRegistrationEmailCommandWrap)
export class ResendRegistrationEmailUseCaseWrap
  implements ICommandHandler<ResendRegistrationEmailCommandWrap>
{
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private usersService: UsersServiceWrap,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: ResendRegistrationEmailCommandWrap): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestException({
        errors: [
          {
            field: 'email',
            message: 'User with specified email does not exist',
          },
        ],
      });
    }

    if (user.confirmationInfo.isConfirmed) {
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
      await this.usersService.updateUserConfirmationCode(user);

    this.eventBus.publish(
      new ConfirmationEmailResendRequestedEvent(email, newConfirmationCode),
    );
  }
}
