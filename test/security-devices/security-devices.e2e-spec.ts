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
import { SecurityDevicesCommonTestManager } from '../helpers/device-sessions.common.test-manager';
import { millisecondsToSeconds } from 'date-fns';

describe('security devices', () => {
  let app: INestApplication;
  let UserModel: UserModelType;
  let authTestManager: AuthTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let securityDevicesTestManager: SecurityDevicesTestManager;
  let jwtTestManager: JwtTestManager;
  let securityDevicesCommonTestManager: SecurityDevicesCommonTestManager;
  const refreshTokenExpInMs = 2000;

  beforeAll(async () => {
    const customBuilderSetup = (builder: TestingModuleBuilder) => {
      builder.overrideProvider(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN).useFactory({
        inject: [CoreConfig],
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.refreshJwtSecret,
            signOptions: {
              expiresIn: millisecondsToSeconds(refreshTokenExpInMs) + 's',
            },
          });
        },
      });
    };
    app = await initApp({ customBuilderSetup });

    UserModel = app.get<UserModelType>(getModelToken('User'));

    authTestManager = new AuthTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);
    securityDevicesTestManager = new SecurityDevicesTestManager(app);
    securityDevicesCommonTestManager = new SecurityDevicesCommonTestManager(
      app,
    );

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

        await delay(refreshTokenExpInMs);

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

      it('should return all active device sessions of user', async () => {
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

      it('should not return device sessions of other users', async () => {
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

        await delay(refreshTokenExpInMs);

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

    describe('authorization', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(2);
      });

      it('should return 403 when user tries to terminate session of another user', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        const foreignRefreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[1],
        );
        const foreignDeviceId =
          jwtTestManager.extractDeviceIdFromRefreshToken(foreignRefreshToken);

        await securityDevicesTestManager.terminateDeviceSession(
          foreignDeviceId,
          refreshToken,
          HttpStatus.FORBIDDEN,
        );

        await authTestManager.assertRefreshTokenIsValid(foreignRefreshToken);
      });
    });

    describe('success', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(2);
      });

      it('should make refresh token of device session invalid', async () => {
        const refreshToken1 = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        const refreshToken2 = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );
        const deviceId2 =
          jwtTestManager.extractDeviceIdFromRefreshToken(refreshToken2);

        await securityDevicesTestManager.terminateDeviceSession(
          deviceId2,
          refreshToken1,
          HttpStatus.NO_CONTENT,
        );

        await authTestManager.assertRefreshTokenIsInvalid(refreshToken2);
      });

      it('should remove device session from active sessions', async () => {
        const refreshToken1 = await authTestManager.getNewRefreshToken(
          usersLoginInput[1],
        );
        const refreshToken2 = await authTestManager.getNewRefreshToken(
          usersLoginInput[1],
        );
        const deviceId1 =
          jwtTestManager.extractDeviceIdFromRefreshToken(refreshToken1);
        const deviceId2 =
          jwtTestManager.extractDeviceIdFromRefreshToken(refreshToken2);

        const deviceSessionsBeforeTermination =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            refreshToken1,
          );

        await securityDevicesTestManager.terminateDeviceSession(
          deviceId2,
          refreshToken1,
          HttpStatus.NO_CONTENT,
        );

        const deviceSessionsAfterLogout =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            refreshToken1,
          );

        expect(deviceSessionsAfterLogout.length).toBe(
          deviceSessionsBeforeTermination.length - 1,
        );
        expect(deviceSessionsAfterLogout[0].deviceId).toBe(deviceId1);
      });
    });
  });

  describe('terminate all other user device sessions', () => {
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
          .delete(SECURITY_DEVICES_PATH)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      // non-existing token
      it('should return 401 if refresh token is invalid', async () => {
        await securityDevicesTestManager.terminateAllOtherUserDeviceSessions(
          'random',
          HttpStatus.UNAUTHORIZED,
        );
      });

      // expired token
      it('should return 401 if refresh token is expired', async () => {
        const expiredRefreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        await delay(refreshTokenExpInMs);

        const otherRefreshTokens =
          await authTestManager.getNewRefreshTokensOfUser(
            usersLoginInput[0],
            2,
          );

        await securityDevicesTestManager.terminateAllOtherUserDeviceSessions(
          expiredRefreshToken,
          HttpStatus.UNAUTHORIZED,
        );

        for (const refreshToken of otherRefreshTokens) {
          await authTestManager.assertRefreshTokenIsValid(refreshToken);
        }
      });
    });

    describe('success', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(4);
      });

      it('should make refresh tokens of all other user device sessions invalid', async () => {
        const refreshTokens = await authTestManager.getNewRefreshTokensOfUser(
          usersLoginInput[0],
          3,
        );

        await securityDevicesTestManager.terminateAllOtherUserDeviceSessions(
          refreshTokens[0],
          HttpStatus.NO_CONTENT,
        );

        for (const refreshToken of refreshTokens.slice(1)) {
          await authTestManager.assertRefreshTokenIsInvalid(refreshToken);
        }
      });

      it('should remove all other user device sessions from active sessions', async () => {
        const refreshTokens = await authTestManager.getNewRefreshTokensOfUser(
          usersLoginInput[1],
          3,
        );
        const currentSessionToken = refreshTokens[0];

        await securityDevicesTestManager.terminateAllOtherUserDeviceSessions(
          currentSessionToken,
          HttpStatus.NO_CONTENT,
        );

        const deviceSessions =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            currentSessionToken,
          );
        expect(deviceSessions.map((s) => s.deviceId)).toEqual([
          jwtTestManager.extractDeviceIdFromRefreshToken(currentSessionToken),
        ]);
      });

      it('should not terminate device sessions of other users', async () => {
        const currentUserRefreshTokens =
          await authTestManager.getNewRefreshTokensOfUser(
            usersLoginInput[2],
            2,
          );
        const foreignRefreshTokens =
          await authTestManager.getNewRefreshTokensOfUser(
            usersLoginInput[3],
            2,
          );

        const foreignDeviceSessionsBefore =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            foreignRefreshTokens[0],
          );

        await securityDevicesTestManager.terminateAllOtherUserDeviceSessions(
          currentUserRefreshTokens[0],
          HttpStatus.NO_CONTENT,
        );

        const foreignDeviceSessionsAfter =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            foreignRefreshTokens[0],
          );
        expect(foreignDeviceSessionsAfter.length).toBe(
          foreignDeviceSessionsBefore.length,
        );
      });
    });
  });
});
