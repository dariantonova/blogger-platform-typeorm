import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ConfirmationEmailResendRequestedEvent } from '../../user-accounts/application/events/confirmation-email-resend-requested.event';
import { EmailService } from '../email.service';

@EventsHandler(ConfirmationEmailResendRequestedEvent)
export class SendConfirmationEmailWhenUserRequestedResendEventHandler
  implements IEventHandler<ConfirmationEmailResendRequestedEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: ConfirmationEmailResendRequestedEvent): Promise<void> {
    try {
      await this.emailService.sendConfirmationEmail(
        event.email,
        event.confirmationCode,
      );
    } catch (err) {
      console.log('Error resending confirmation email: ' + err);
    }
  }
}
