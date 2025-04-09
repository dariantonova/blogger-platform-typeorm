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
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { UserAccountsConfig } from './user-accounts.config';
import { CoreModule } from '../../core/core.module';
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
];

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          secret: coreConfig.accessJwtSecret,
          signOptions: {
            expiresIn: coreConfig.accessTokenLifetimeInSeconds + 's',
          },
        };
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CoreModule,
    CqrsModule.forRoot(),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    BasicStrategy,
    AuthService,
    LocalStrategy,
    CryptoService,
    JwtStrategy,
    AuthQueryRepository,
    UserAccountsConfig,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class UserAccountsModule {}
