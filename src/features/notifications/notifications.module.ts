import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { EmailService } from './email.service';
import { CoreConfig } from '../../core/core.config';
import { SendConfirmationEmailWhenUserRegisteredEventHandler } from './event-handlers/send-confirmation-email-when-user-registered.event-handler';
import { SendConfirmationEmailWhenUserRequestedResendEventHandler } from './event-handlers/send-confirmation-email-when-user-requested-resend.event-handler';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        const transport = coreConfig.mailTransport;
        const mailFromName = coreConfig.mailFromName;
        const mailFromAddress = transport.split(':')[1].split('//')[1];

        return {
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
        };
      },
    }),
  ],
  providers: [
    EmailService,
    SendConfirmationEmailWhenUserRegisteredEventHandler,
    SendConfirmationEmailWhenUserRequestedResendEventHandler,
  ],
  exports: [EmailService],
})
export class NotificationsModule {}
