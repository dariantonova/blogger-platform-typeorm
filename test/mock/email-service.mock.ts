import { EmailService } from '../../src/features/notifications/email.service';

export class EmailServiceMock extends EmailService {
  async sendConfirmationEmail(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    console.log('Call mock method sendConfirmationEmail / EmailServiceMock');
  }
}
