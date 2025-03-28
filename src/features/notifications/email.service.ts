import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(
    email: string,
    confirmationCode: string,
  ): Promise<SentMessageInfo> {
    return this.mailerService.sendMail({
      to: email,
      subject: 'Finish registration',
      template: 'confirm-email',
      context: {
        confirmationCode: confirmationCode,
      },
    });
  }
}
