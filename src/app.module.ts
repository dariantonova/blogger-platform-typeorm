import { configModule } from './dynamic-config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { CoreConfig } from './core/core.config';
import { configValidationUtility } from './core/config-validation.utility';
import { CoreModule } from './core/core.module';
import { ErrorExceptionFilter } from './core/exceptions/filters/error-exceptions.filter';
import { NotificationsModule } from './features/notifications/notifications.module';

const testingModule: any[] = [];
if (
  configValidationUtility.convertToBoolean(process.env.INCLUDE_TESTING_MODULE)
) {
  testingModule.push(TestingModule);
}

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          uri: coreConfig.mongoUri,
          dbName: coreConfig.dbName,
        };
      },
    }),
    UserAccountsModule,
    BloggerPlatformModule,
    NotificationsModule,
    ...testingModule,
    CoreModule,
    configModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorExceptionFilter],
})
export class AppModule {}
