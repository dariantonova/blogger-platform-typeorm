import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { ErrorExceptionFilter } from './core/exceptions/filters/error-exceptions.filter';
import { NotificationsModule } from './features/notifications/notifications.module';

@Module({
  imports: [CoreModule, configModule],
  controllers: [AppController],
  providers: [AppService, ErrorExceptionFilter],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const modules: any[] = [
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
    ];

    if (coreConfig.includeTestingModule) {
      modules.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: modules,
    };
  }
}
