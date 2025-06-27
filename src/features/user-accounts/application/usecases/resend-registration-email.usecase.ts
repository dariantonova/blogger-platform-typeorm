import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { ConfirmationEmailResendRequestedEvent } from '../../domain/events/confirmation-email-resend-requested.event';
import { UsersRepo } from '../../infrastructure/users.repo';

export class ResendRegistrationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailUseCase
  implements ICommandHandler<ResendRegistrationEmailCommand>
{
  constructor(
    private usersRepository: UsersRepo,
    private usersService: UsersService,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: ResendRegistrationEmailCommand): Promise<void> {
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
