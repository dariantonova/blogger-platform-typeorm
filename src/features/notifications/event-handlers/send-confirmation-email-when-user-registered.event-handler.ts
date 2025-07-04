import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../user-accounts/application/events/user-registered.event';
import { EmailService } from '../email.service';

@EventsHandler(UserRegisteredEvent)
export class SendConfirmationEmailWhenUserRegisteredEventHandler
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      await this.emailService.sendConfirmationEmail(
        event.email,
        event.confirmationCode,
      );
    } catch (err) {
      console.log('Error sending confirmation email: ' + err);
    }
  }
}
