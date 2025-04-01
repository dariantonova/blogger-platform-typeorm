import { EmailService } from '../../src/features/notifications/email.service';

export class EmailServiceMock extends EmailService {
  sendConfirmationEmail = jest.fn().mockResolvedValue(undefined);
}
