import { Module } from '@nestjs/common';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { CryptoService } from './application/crypto.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserAccountsConfig } from './user-accounts.config';
import { CoreConfig } from '../../core/core.config';
import { CqrsModule } from '@nestjs/cqrs';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { ThrottlerModule } from '@nestjs/throttler';
import { BloggerPlatformModule } from '../blogger-platform/blogger-platform.module';
import { UsersController } from './api/users.controller';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { JwtAccessStrategy } from './guards/bearer/jwt-access.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtRefreshStrategy } from './guards/refresh-token/jwt-refresh.strategy';
import { UsersRepository } from './infrastructure/users.repository';
import { DeviceAuthSessionsRepository } from './infrastructure/device-auth-sessions.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { DeviceAuthSessionsQueryRepository } from './infrastructure/query/device-auth-sessions.query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { AuthService } from './application/auth.service';
import { UsersService } from './application/users.service';
import { GetUserByIdOrInternalFailQueryHandler } from './application/queries/get-user-by-id-or-internal-fail.query';
import { GetUserDeviceSessionsQueryHandler } from './application/queries/get-user-device-sessions.query';
import { GetUsersQueryHandler } from './application/queries/get-users.query';
import { MeQueryHandler } from './application/queries/me.query';
import { ConfirmRegistrationUseCase } from './application/usecases/confirm-registration.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { LogoutUserUseCase } from './application/usecases/logout-user.usecase';
import { RecoverPasswordUseCase } from './application/usecases/recover-password.usecase';
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecase';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { ResendRegistrationEmailUseCase } from './application/usecases/resend-registration-email.usecase';
import { SetNewPasswordUseCase } from './application/usecases/set-new-password.usecase';
import { TerminateAllOtherUserDeviceSessionsUseCase } from './application/usecases/terminate-all-other-user-device-sessions.usecase';
import { TerminateDeviceSessionUseCase } from './application/usecases/terminate-device-session.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/user-accounts/user.entity';
import { UserConfirmation } from '../typeorm/entities/user-accounts/user-confirmation.entity';
import { PasswordRecovery } from '../typeorm/entities/user-accounts/password-recovery.entity';
import { PgController } from '../typeorm/pg.controller';
import { DeviceAuthSession } from '../typeorm/entities/user-accounts/device-auth-session.entity';

const controllers = [
  UsersController,
  AuthController,
  SecurityDevicesController,
];
const providers = [
  BasicStrategy,
  CryptoService,
  UserAccountsConfig,
  AuthService,
  UsersService,
  JwtAccessStrategy,
  LocalStrategy,
  JwtRefreshStrategy,
  UsersRepository,
  DeviceAuthSessionsRepository,
  UsersQueryRepository,
  DeviceAuthSessionsQueryRepository,
  AuthQueryRepository,
];
const queryHandlers = [
  GetUserByIdOrInternalFailQueryHandler,
  GetUserDeviceSessionsQueryHandler,
  GetUsersQueryHandler,
  MeQueryHandler,
];
const commandHandlers = [
  ConfirmRegistrationUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  LogoutUserUseCase,
  RecoverPasswordUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  ResendRegistrationEmailUseCase,
  SetNewPasswordUseCase,
  TerminateAllOtherUserDeviceSessionsUseCase,
  TerminateDeviceSessionUseCase,
];

@Module({
  imports: [
    JwtModule,
    CqrsModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => [
        {
          ttl: coreConfig.authThrottleTtlInMilliseconds,
          limit: coreConfig.authThrottleLimit,
        },
      ],
    }),
    TypeOrmModule.forFeature([
      User,
      UserConfirmation,
      PasswordRecovery,
      DeviceAuthSession,
    ]),
    BloggerPlatformModule,
  ],
  controllers: [...controllers, PgController],
  providers: [
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.accessJwtSecret,
          signOptions: {
            expiresIn: coreConfig.accessTokenLifetimeInSeconds + 's',
          },
        });
      },
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.refreshJwtSecret,
          signOptions: {
            expiresIn: coreConfig.refreshTokenLifetimeInSeconds + 's',
          },
        });
      },
    },
    ...providers,
    ...queryHandlers,
    ...commandHandlers,
  ],
})
export class UserAccountsModule {}
