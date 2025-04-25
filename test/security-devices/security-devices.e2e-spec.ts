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
import request from 'supertest';
import { DeviceViewDto } from '../../src/features/user-accounts/api/view-dto/device.view-dto';
import { JwtTestManager } from '../helpers/jwt.test-manager';
import { LoginInputDto } from '../../src/features/user-accounts/api/input-dto/login.input-dto';

describe('security devices', () => {
  let app: INestApplication;
  let UserModel: UserModelType;
  let authTestManager: AuthTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let securityDevicesTestManager: SecurityDevicesTestManager;
  let jwtTestManager: JwtTestManager;

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

    const refreshJwtService = app.get<JwtService>(
      REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
    );
    jwtTestManager = new JwtTestManager(refreshJwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get user device sessions', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('authentication', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(1);
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
          usersLoginInput[0],
        );

        await delay(2000);

        await securityDevicesTestManager.getUserDeviceSessions(
          refreshToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });

    describe('success', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(4);
      });

      it('should return device sessions with correct structure', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        const response = await securityDevicesTestManager.getUserDeviceSessions(
          refreshToken,
          HttpStatus.OK,
        );
        const deviceSessions = response.body as DeviceViewDto[];
        expect(deviceSessions).toEqual([
          {
            ip: expect.any(String),
            title: expect.any(String),
            lastActiveDate: expect.any(String),
            deviceId: expect.any(String),
          },
        ]);
      });

      it('should return all active sessions of user', async () => {
        const refreshTokens: string[] = [];
        for (let i = 0; i < 3; i++) {
          const refreshToken = await authTestManager.getNewRefreshToken(
            usersLoginInput[1],
          );
          refreshTokens.push(refreshToken);
        }
        const deviceIdsFromTokens = refreshTokens.map((refToken) =>
          jwtTestManager.extractDeviceIdFromRefreshToken(refToken),
        );

        const response = await securityDevicesTestManager.getUserDeviceSessions(
          refreshTokens[0],
          HttpStatus.OK,
        );
        const deviceSessions = response.body as DeviceViewDto[];
        const returnedDeviceIds = deviceSessions.map((s) => s.deviceId);
        expect(returnedDeviceIds).toEqual(
          expect.arrayContaining(deviceIdsFromTokens),
        );
        expect(returnedDeviceIds.length).toBe(deviceIdsFromTokens.length);
      });

      it('should not return sessions of other users', async () => {
        const currentUserRefreshToken =
          await authTestManager.getNewRefreshToken(usersLoginInput[2]);

        const foreignRefreshTokens: string[] = [];
        for (let i = 0; i < 2; i++) {
          const foreignRefreshToken = await authTestManager.getNewRefreshToken(
            usersLoginInput[3],
          );
          foreignRefreshTokens.push(foreignRefreshToken);
        }
        const foreignDeviceIds = foreignRefreshTokens.map((refToken) =>
          jwtTestManager.extractDeviceIdFromRefreshToken(refToken),
        );

        const response = await securityDevicesTestManager.getUserDeviceSessions(
          currentUserRefreshToken,
          HttpStatus.OK,
        );
        const deviceSessions = response.body as DeviceViewDto[];
        const returnedDeviceIds = deviceSessions.map((s) => s.deviceId);
        for (const foreignDeviceId of foreignDeviceIds) {
          expect(returnedDeviceIds).not.toContain(foreignDeviceId);
        }
      });
    });
  });

  describe('terminate device session', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('authentication', () => {
      let usersLoginInput: LoginInputDto[];
      let deviceIdToTerminateRefreshToken: string;

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(1);
      });

      afterEach(async () => {
        await authTestManager.assertRefreshTokenIsValid(
          deviceIdToTerminateRefreshToken,
        );
      });

      // missing
      it('should return 401 if refresh token cookie is missing', async () => {
        deviceIdToTerminateRefreshToken =
          await authTestManager.getNewRefreshToken(usersLoginInput[0]);
        const deviceIdToTerminate =
          jwtTestManager.extractDeviceIdFromRefreshToken(
            deviceIdToTerminateRefreshToken,
          );

        await request(app.getHttpServer())
          .delete(SECURITY_DEVICES_PATH + '/' + deviceIdToTerminate)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      // non-existing token
      it('should return 401 if refresh token is invalid', async () => {
        deviceIdToTerminateRefreshToken =
          await authTestManager.getNewRefreshToken(usersLoginInput[0]);
        const deviceIdToTerminate =
          jwtTestManager.extractDeviceIdFromRefreshToken(
            deviceIdToTerminateRefreshToken,
          );

        await securityDevicesTestManager.terminateDeviceSession(
          deviceIdToTerminate,
          'random',
          HttpStatus.UNAUTHORIZED,
        );
      });

      // expired token
      it('should return 401 if refresh token is expired', async () => {
        const expiredRefreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        await delay(2000);

        deviceIdToTerminateRefreshToken =
          await authTestManager.getNewRefreshToken(usersLoginInput[0]);
        const deviceIdToTerminate =
          jwtTestManager.extractDeviceIdFromRefreshToken(
            deviceIdToTerminateRefreshToken,
          );

        await securityDevicesTestManager.terminateDeviceSession(
          deviceIdToTerminate,
          expiredRefreshToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });

    // describe('authorization', () => {});
    //
    // describe('success', () => {});
  });
});
