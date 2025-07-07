import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { CoreConfig, Environment } from './core/core.config';
import { CoreModule } from './core/core.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { HttpExceptionsFilter } from './core/exceptions/filters/http-exceptions.filter';

@Module({
  imports: [CoreModule, configModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionsFilter,
    },
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const modules: any[] = [
      TypeOrmModule.forRootAsync({
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => {
          return {
            type: 'postgres',
            host: coreConfig.pgHost,
            port: coreConfig.pgPort,
            username: coreConfig.pgUsername,
            password: coreConfig.pgPassword,
            database: coreConfig.pgDbName,
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
            namingStrategy: new SnakeNamingStrategy(),
          };
        },
      }),
      ServeStaticModule.forRootAsync({
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => {
          return [
            {
              rootPath: join(__dirname, '..', 'swagger-static'),
              serveRoot:
                coreConfig.env === Environment.DEVELOPMENT ? '/' : '/swagger',
            },
          ];
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
