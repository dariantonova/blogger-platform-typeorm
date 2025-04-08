import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PasswordRecoveryRequestedEvent } from '../../user-accounts/domain/events/password-recovery-requested.event';
import { EmailService } from '../email.service';

@EventsHandler(PasswordRecoveryRequestedEvent)
export class SendRecoveryEmailWhenPasswordRecoveryRequestedEventHandler
  implements IEventHandler<PasswordRecoveryRequestedEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: PasswordRecoveryRequestedEvent): Promise<void> {
    try {
      await this.emailService.sendPasswordRecoveryEmail(
        event.email,
        event.recoveryCode,
      );
    } catch (err) {
      console.log('Error sending recovery email: ' + err);
    }
  }
}
