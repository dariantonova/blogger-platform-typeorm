import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { User, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { CryptoService } from './application/crypto.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAccessStrategy } from './guards/bearer/jwt-access.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { UserAccountsConfig } from './user-accounts.config';
import { CoreConfig } from '../../core/core.config';
import { CreateUserUseCase } from './application/usecases/admins/create-user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserUseCase } from './application/usecases/admins/delete-user.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { ResendRegistrationEmailUseCase } from './application/usecases/resend-registration-email.usecase';
import { ConfirmRegistrationUseCase } from './application/usecases/confirm-registration.usecase';
import { RecoverPasswordUseCase } from './application/usecases/recover-password.usecase';
import { SetNewPasswordUseCase } from './application/usecases/set-new-password.usecase';
import { GetUsersQueryHandler } from './application/queries/get-users.query';
import { GetUserByIdOrInternalFailQueryHandler } from './application/queries/get-user-by-id-or-internal-fail.query';
import { MeQueryHandler } from './application/queries/me.query';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import {
  DeviceAuthSession,
  DeviceAuthSessionSchema,
} from './domain/device-auth-session.entity';
import { DeviceAuthSessionsRepository } from './infrastructure/device-auth-sessions.repository';
import { JwtRefreshStrategy } from './guards/refresh-token/jwt-refresh.strategy';
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecase';
import { LogoutUserUseCase } from './application/usecases/logout-user.usecase';
import { DeviceAuthSessionsQueryRepository } from './infrastructure/query/device-auth-sessions.query-repository';
import { GetUserDeviceSessionsQueryHandler } from './application/queries/get-user-device-sessions.query';
import { TerminateDeviceSessionUseCase } from './application/usecases/terminate-device-session.usecase';
import { TerminateAllOtherUserDeviceSessionsUseCase } from './application/usecases/users/terminate-all-other-device-sessions.usecase';
import { ThrottlerModule } from '@nestjs/throttler';
import { GetUsersQueryHandlerSql } from '../user-accounts-sql/application/queries/get-users.query.sql';
import { UsersQueryRepositorySql } from '../user-accounts-sql/infrastructure/query/users.query-repository.sql';
import { UsersControllerSql } from '../user-accounts-sql/api/users.controller.sql';
import { GetUserByIdOrInternalFailQueryHandlerSql } from '../user-accounts-sql/application/queries/get-user-by-id-or-internal-fail.query.sql';
import { UsersRepositorySql } from '../user-accounts-sql/infrastructure/users.repository.sql';
import { CreateUserUseCaseSql } from '../user-accounts-sql/application/usecases/create-user.usecase.sql';
import { DeleteUserUseCaseSql } from '../user-accounts-sql/application/usecases/delete-user.usecase.sql';
import { DeviceAuthSessionsRepositorySql } from '../user-accounts-sql/infrastructure/device-auth-sessions.repository.sql';
import { LocalStrategySql } from '../user-accounts-sql/guards/local/local.strategy.sql';
import { AuthServiceSql } from '../user-accounts-sql/application/auth.service.sql';
import { LoginUserUseCaseSql } from '../user-accounts-sql/application/usecases/login-user.usecase.sql';
import { AuthControllerSql } from '../user-accounts-sql/api/auth.controller.sql';
import { JwtAccessStrategySql } from '../user-accounts-sql/guards/bearer/jwt-access.strategy.sql';
import { AuthQueryRepositorySql } from '../user-accounts-sql/infrastructure/query/auth.query-repository.sql';
import { MeQueryHandlerSql } from '../user-accounts-sql/application/queries/me.query.sql';
import { RegisterUserUseCaseSql } from '../user-accounts-sql/application/usecases/register-user.usecase.sql';
import { UsersServiceSql } from '../user-accounts-sql/application/users.service.sql';
import { ResendRegistrationEmailUseCaseSql } from '../user-accounts-sql/application/usecases/resend-registration-email.usecase.sql';
import { ConfirmRegistrationUseCaseSql } from '../user-accounts-sql/application/usecases/confirm-registration.usecase.sql';
import { RecoverPasswordUseCaseSql } from '../user-accounts-sql/application/usecases/recover-password.usecase.sql';
import { SetNewPasswordUseCaseSql } from '../user-accounts-sql/application/usecases/set-new-password.usecase.sql';
import { RefreshTokenUseCaseSql } from '../user-accounts-sql/application/usecases/refresh-token.usecase.sql';
import { JwtRefreshStrategySql } from '../user-accounts-sql/guards/refresh-token/jwt-refresh.strategy.sql';
import { LogoutUserUseCaseSql } from '../user-accounts-sql/application/usecases/logout-user.usecase.sql';
import { SecurityDevicesControllerSql } from '../user-accounts-sql/api/security-devices.controller.sql';
import { DeviceAuthSessionsQueryRepositorySql } from '../user-accounts-sql/infrastructure/query/device-auth-sessions.query-repository.sql';
import { GetUserDeviceSessionsQueryHandlerSql } from '../user-accounts-sql/application/queries/get-user-device-sessions.query.sql';
import { TerminateDeviceSessionUseCaseSql } from '../user-accounts-sql/application/usecases/terminate-device-session.usecase.sql';
import { TerminateAllOtherUserDeviceSessionsUseCaseSql } from '../user-accounts-sql/application/usecases/terminate-all-other-user-device-sessions.usecase.sql';
import { UsersExternalQueryRepositorySql } from '../user-accounts-sql/infrastructure/external-query/users.external-query-repository.sql';
import { BloggerPlatformModule } from '../blogger-platform/blogger-platform.module';
import { UsersControllerWrap } from '../user-accounts-wrap/api/users.controller.wrap';
import { AuthControllerWrap } from '../user-accounts-wrap/api/auth.controller.wrap';
import { SecurityDevicesControllerWrap } from '../user-accounts-wrap/api/security-devices.controller.wrap';
import { GetUserByIdOrInternalFailQueryHandlerWrap } from '../user-accounts-wrap/application/queries/get-user-by-id-or-internal-fail.query.wrap';
import { GetUserDeviceSessionsQueryHandlerWrap } from '../user-accounts-wrap/application/queries/get-user-device-sessions.query.wrap';
import { GetUsersQueryHandlerWrap } from '../user-accounts-wrap/application/queries/get-users.query.wrap';
import { MeQueryHandlerWrap } from '../user-accounts-wrap/application/queries/me.query.wrap';
import { ConfirmRegistrationUseCaseWrap } from '../user-accounts-wrap/application/usecases/confirm-registration.usecase.wrap';
import { CreateUserUseCaseWrap } from '../user-accounts-wrap/application/usecases/create-user.usecase.wrap';
import { DeleteUserUseCaseWrap } from '../user-accounts-wrap/application/usecases/delete-user.usecase.wrap';
import { LoginUserUseCaseWrap } from '../user-accounts-wrap/application/usecases/login-user.usecase.wrap';
import { LogoutUserUseCaseWrap } from '../user-accounts-wrap/application/usecases/logout-user.usecase.wrap';
import { RecoverPasswordUseCaseWrap } from '../user-accounts-wrap/application/usecases/recover-password.usecase.wrap';
import { RefreshTokenUseCaseWrap } from '../user-accounts-wrap/application/usecases/refresh-token.usecase.wrap';
import { RegisterUserUseCaseWrap } from '../user-accounts-wrap/application/usecases/register-user.usecase.wrap';
import { ResendRegistrationEmailUseCaseWrap } from '../user-accounts-wrap/application/usecases/resend-registration-email.usecase.wrap';
import { SetNewPasswordUseCaseWrap } from '../user-accounts-wrap/application/usecases/set-new-password.usecase.wrap';
import { TerminateAllOtherUserDeviceSessionsUseCaseWrap } from '../user-accounts-wrap/application/usecases/terminate-all-other-device-sessions.usecase.wrap';
import { TerminateDeviceSessionUseCaseWrap } from '../user-accounts-wrap/application/usecases/terminate-device-session.usecase.wrap';
import { AuthServiceWrap } from '../user-accounts-wrap/application/auth.service.wrap';
import { UsersServiceWrap } from '../user-accounts-wrap/application/users.service.wrap';
import { JwtAccessStrategyWrap } from '../user-accounts-wrap/guards/bearer/jwt-access.strategy.wrap';
import { LocalStrategyWrap } from '../user-accounts-wrap/guards/local/local.strategy.wrap';
import { JwtRefreshStrategyWrap } from '../user-accounts-wrap/guards/refresh-token/jwt-refresh.strategy.wrap';
import { UsersRepositoryWrap } from '../user-accounts-wrap/infrastructure/users.repository.wrap';
import { DeviceAuthSessionsRepositoryWrap } from '../user-accounts-wrap/infrastructure/device-auth-sessions.repository.wrap';
import { UsersQueryRepositoryWrap } from '../user-accounts-wrap/infrastructure/query/users.query-repository.wrap';
import { DeviceAuthSessionsQueryRepositoryWrap } from '../user-accounts-wrap/infrastructure/query/device-auth-sessions.query-repository.wrap';
import { AuthQueryRepositoryWrap } from '../user-accounts-wrap/infrastructure/query/auth.query-repository.wrap';

const commandHandlers = [
  CreateUserUseCase,
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  ResendRegistrationEmailUseCase,
  ConfirmRegistrationUseCase,
  RecoverPasswordUseCase,
  SetNewPasswordUseCase,
  RefreshTokenUseCase,
  LogoutUserUseCase,
  TerminateDeviceSessionUseCase,
  TerminateAllOtherUserDeviceSessionsUseCase,
];

const queryHandlers = [
  GetUsersQueryHandler,
  GetUserByIdOrInternalFailQueryHandler,
  MeQueryHandler,
  GetUserDeviceSessionsQueryHandler,
];

const commandHandlersSql = [
  CreateUserUseCaseSql,
  DeleteUserUseCaseSql,
  LoginUserUseCaseSql,
  RegisterUserUseCaseSql,
  ResendRegistrationEmailUseCaseSql,
  ConfirmRegistrationUseCaseSql,
  RecoverPasswordUseCaseSql,
  SetNewPasswordUseCaseSql,
  RefreshTokenUseCaseSql,
  LogoutUserUseCaseSql,
  TerminateDeviceSessionUseCaseSql,
  TerminateAllOtherUserDeviceSessionsUseCaseSql,
];
const queryHandlersSql = [
  GetUsersQueryHandlerSql,
  GetUserByIdOrInternalFailQueryHandlerSql,
  MeQueryHandlerSql,
  GetUserDeviceSessionsQueryHandlerSql,
];
const providersSql = [
  UsersQueryRepositorySql,
  UsersRepositorySql,
  DeviceAuthSessionsRepositorySql,
  LocalStrategySql,
  AuthServiceSql,
  JwtAccessStrategySql,
  AuthQueryRepositorySql,
  UsersServiceSql,
  JwtRefreshStrategySql,
  DeviceAuthSessionsQueryRepositorySql,
  UsersExternalQueryRepositorySql,
];
const controllersSql = [
  UsersControllerSql,
  AuthControllerSql,
  SecurityDevicesControllerSql,
];

const controllersWrap = [
  UsersControllerWrap,
  AuthControllerWrap,
  SecurityDevicesControllerWrap,
];
const providersWrap = [
  AuthServiceWrap,
  UsersServiceWrap,
  JwtAccessStrategyWrap,
  LocalStrategyWrap,
  JwtRefreshStrategyWrap,
  UsersRepositoryWrap,
  DeviceAuthSessionsRepositoryWrap,
  UsersQueryRepositoryWrap,
  DeviceAuthSessionsQueryRepositoryWrap,
  AuthQueryRepositoryWrap,
];
const queryHandlersWrap = [
  GetUserByIdOrInternalFailQueryHandlerWrap,
  GetUserDeviceSessionsQueryHandlerWrap,
  GetUsersQueryHandlerWrap,
  MeQueryHandlerWrap,
];
const commandHandlersWrap = [
  ConfirmRegistrationUseCaseWrap,
  CreateUserUseCaseWrap,
  DeleteUserUseCaseWrap,
  LoginUserUseCaseWrap,
  LogoutUserUseCaseWrap,
  RecoverPasswordUseCaseWrap,
  RefreshTokenUseCaseWrap,
  RegisterUserUseCaseWrap,
  ResendRegistrationEmailUseCaseWrap,
  SetNewPasswordUseCaseWrap,
  TerminateAllOtherUserDeviceSessionsUseCaseWrap,
  TerminateDeviceSessionUseCaseWrap,
];

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
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
    forwardRef(() => BloggerPlatformModule),
  ],
  controllers: [
    // UsersController,
    // AuthController,
    // SecurityDevicesController,
    // ...controllersSql,
    ...controllersWrap,
  ],
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
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    BasicStrategy,
    AuthService,
    LocalStrategy,
    CryptoService,
    JwtAccessStrategy,
    AuthQueryRepository,
    UserAccountsConfig,
    ...commandHandlers,
    ...queryHandlers,
    UsersExternalQueryRepository,
    DeviceAuthSessionsRepository,
    JwtRefreshStrategy,
    DeviceAuthSessionsQueryRepository,
    ...queryHandlersSql,
    ...providersSql,
    ...commandHandlersSql,
    ...providersWrap,
    ...queryHandlersWrap,
    ...commandHandlersWrap,
  ],
  exports: [UsersExternalQueryRepository, UsersExternalQueryRepositorySql],
})
export class UserAccountsModule {}
