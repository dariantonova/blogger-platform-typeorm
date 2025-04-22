import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { User, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { CryptoService } from './application/crypto.service';
import { AuthController } from './api/auth.controller';
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

const commandHandlers = [
  CreateUserUseCase,
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  ResendRegistrationEmailUseCase,
  ConfirmRegistrationUseCase,
  RecoverPasswordUseCase,
  SetNewPasswordUseCase,
];

const queryHandlers = [
  GetUsersQueryHandler,
  GetUserByIdOrInternalFailQueryHandler,
  MeQueryHandler,
];

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
    CqrsModule.forRoot(),
  ],
  controllers: [UsersController, AuthController],
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
  ],
  exports: [UsersExternalQueryRepository],
})
export class UserAccountsModule {}
