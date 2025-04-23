import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import {
  delay,
  deleteAllData,
  initApp,
  SECURITY_DEVICES_PATH,
} from '../helpers/helper';
import { TestingModuleBuilder } from '@nestjs/testing';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { SecurityDevicesTestManager } from './helpers/security-devices.test-manager';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import request from 'supertest';

describe('security devices', () => {
  let app: INestApplication;
  let UserModel: UserModelType;
  let authTestManager: AuthTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let securityDevicesTestManager: SecurityDevicesTestManager;

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder.overrideProvider(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN).useFactory({
        inject: [CoreConfig],
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.refreshJwtSecret,
            signOptions: {
              expiresIn: '2s',
            },
          });
        },
      });
    });

    UserModel = app.get<UserModelType>(getModelToken('User'));

    authTestManager = new AuthTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);
    securityDevicesTestManager = new SecurityDevicesTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get user device sessions', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('authentication', () => {
      let usersData: CreateUserDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersData = [];
        for (let i = 1; i <= 1; i++) {
          usersData.push({
            login: 'user' + i,
            email: 'user' + i + '@example.com',
            password: 'qwerty',
          });
        }
        await usersCommonTestManager.createUsers(usersData);
      });

      // missing
      it('should return 401 if refresh token cookie is missing', async () => {
        await request(app.getHttpServer())
          .get(SECURITY_DEVICES_PATH)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      // non-existing token
      it('should return 401 if refresh token is invalid', async () => {
        await securityDevicesTestManager.getUserDeviceSessions(
          'random',
          HttpStatus.UNAUTHORIZED,
        );
      });

      // expired token
      it('should return 401 if refresh token is expired', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersData[0].login,
          usersData[0].password,
        );

        await delay(2000);

        await securityDevicesTestManager.getUserDeviceSessions(
          refreshToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });
  });
});
