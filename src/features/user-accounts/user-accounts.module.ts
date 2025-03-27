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

@Module({
  imports: [
    JwtModule.register({
      secret: 'access-token-secret',
      signOptions: {
        expiresIn: '5m',
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
  ],
})
export class UserAccountModule {}
