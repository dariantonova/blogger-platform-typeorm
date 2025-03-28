import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { EmailService } from './email.service';

const transport = process.env.MAIL_TRANSPORT || '';
const mailFromName = process.env.MAIL_FROM_NAME || '';
const mailFromAddress = transport.split(':')[1].split('//')[1];

@Module({
  imports: [
    MailerModule.forRoot({
      transport,
      defaults: {
        from: `"${mailFromName}" <${mailFromAddress}>`,
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new EjsAdapter(),
        options: {
          strict: false,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
