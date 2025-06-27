import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  AUTH_PATH,
  delay,
  deleteAllData,
  initApp,
  waitForTokenRotation,
} from '../helpers/helper';
import { AuthTestManager } from './helpers/auth.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { LoginInputDto } from '../../src/features/user-accounts/api/input-dto/login.input-dto';
import {
  MeViewDto,
  UserViewDto,
} from '../../src/features/user-accounts/api/view-dto/user.view-dto';
import { TestingModuleBuilder } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../src/features/notifications/email.service';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';
import { UsersTestManager } from '../users/helpers/users.test-manager';
import { RegistrationConfirmationCodeInputDto } from '../../src/features/user-accounts/api/input-dto/registration-confirmation-code.input-dto';
import { RegistrationEmailResendingInputDto } from '../../src/features/user-accounts/api/input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryInputDto } from '../../src/features/user-accounts/api/input-dto/password-recovery.input-dto';
import { CryptoService } from '../../src/features/user-accounts/application/crypto.service';
import { NewPasswordRecoveryInputDto } from '../../src/features/user-accounts/api/input-dto/new-password-recovery.input-dto';
import { CoreConfig } from '../../src/core/core.config';
import { ConfigService } from '@nestjs/config';
import { UserAccountsConfig } from '../../src/features/user-accounts/user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import request from 'supertest';
import { JwtTestManager } from '../helpers/jwt.test-manager';
import { SecurityDevicesCommonTestManager } from '../helpers/device-sessions.common.test-manager';
import { millisecondsToSeconds } from 'date-fns';
import { DataSource } from 'typeorm';
import { UsersTestRepo } from '../helpers/repositories/typeorm/users.test-repo';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let usersTestManager: UsersTestManager;
  let securityDevicesCommonTestManager: SecurityDevicesCommonTestManager;
  let jwtTestManager: JwtTestManager;
  let usersTestRepository: UsersTestRepo;

  const accessTokenExpInMs = 2000;
  const refreshTokenExpInMs = 3000;
  const emailConfirmationCodeExpInMs = 2000;

  beforeAll(async () => {
    const customBuilderSetup = (builder: TestingModuleBuilder) => {
      builder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          inject: [CoreConfig],
          factory: (coreConfig: CoreConfig) => {
            return new JwtService({
              secret: coreConfig.accessJwtSecret,
              signOptions: {
                expiresIn: millisecondsToSeconds(accessTokenExpInMs) + 's',
              },
            });
          },
        })
        .overrideProvider(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          inject: [CoreConfig],
          factory: (coreConfig: CoreConfig) => {
            return new JwtService({
              secret: coreConfig.refreshJwtSecret,
              signOptions: {
                expiresIn: millisecondsToSeconds(refreshTokenExpInMs) + 's',
              },
            });
          },
        })
        .overrideProvider(UserAccountsConfig)
        .useFactory({
          inject: [ConfigService],
          factory: (configService: ConfigService) => {
            return {
              ...new UserAccountsConfig(configService),
              emailConfirmationCodeLifetimeInSeconds: millisecondsToSeconds(
                emailConfirmationCodeExpInMs,
              ),
            };
          },
        });
    };
    app = await initApp({ customBuilderSetup });

    authTestManager = new AuthTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app);
    usersTestManager = new UsersTestManager(app);
    securityDevicesCommonTestManager = new SecurityDevicesCommonTestManager(
      app,
    );

    const refreshJwtService = app.get<JwtService>(
      REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
    );
    jwtTestManager = new JwtTestManager(refreshJwtService);

    const dataSource = app.get(DataSource);
    usersTestRepository = new UsersTestRepo(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login', () => {
    const userData: CreateUserDto = {
      login: 'user1',
      email: 'user1@example.com',
      password: 'qwerty',
    };

    beforeAll(async () => {
      await deleteAllData(app);

      await usersCommonTestManager.createUser(userData);
    });

    // username or password missing (401)
    it('should return 401 if required fields are missing', async () => {
      const invalidDataCases: any[] = [];

      // loginOrEmail
      const data1 = {
        password: userData.password,
      };
      invalidDataCases.push(data1);

      const data2 = {
        loginOrEmail: '',
        password: userData.password,
      };
      invalidDataCases.push(data2);

      // password
      const data3 = {
        loginOrEmail: userData.login,
      };
      invalidDataCases.push(data3);

      const data4 = {
        loginOrEmail: userData.login,
        password: '',
      };
      invalidDataCases.push(data4);

      const data5 = {};
      invalidDataCases.push(data5);

      for (const data of invalidDataCases) {
        await authTestManager.login(data, HttpStatus.UNAUTHORIZED);
      }
    });

    // username or password invalid
    it('should return 400 if login or email is invalid', async () => {
      const invalidDataCases: any[] = [];

      // not string
      const data1 = {
        loginOrEmail: 4,
        password: userData.password,
      };
      invalidDataCases.push(data1);

      // empty string with spaces
      const data2 = {
        loginOrEmail: '  ',
        password: userData.password,
      };
      invalidDataCases.push(data2);

      for (const data of invalidDataCases) {
        const response = await authTestManager.login(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'loginOrEmail',
              message: expect.any(String),
            },
          ],
        });
      }
    });

    it('should return 400 if password is invalid', async () => {
      const invalidDataCases: any[] = [];

      // not string
      const data1 = {
        loginOrEmail: userData.login,
        password: 4,
      };
      invalidDataCases.push(data1);

      // empty string with spaces
      const data2 = {
        loginOrEmail: userData.login,
        password: '  ',
      };
      invalidDataCases.push(data2);

      for (const data of invalidDataCases) {
        const response = await authTestManager.login(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'password',
              message: expect.any(String),
            },
          ],
        });
      }
    });

    // both username and password invalid (400 with multiple errors)
    it('should return multiple errors if multiple fields are invalid', async () => {
      const data = {
        loginOrEmail: 4,
        password: '  ',
      };

      const response = await authTestManager.login(
        data,
        HttpStatus.BAD_REQUEST,
      );
      expect(response.body).toEqual({
        errorsMessages: expect.arrayContaining([
          {
            field: 'loginOrEmail',
            message: expect.any(String),
          },
          {
            field: 'password',
            message: expect.any(String),
          },
        ]),
      });
    });

    // username doesn't exist
    it(`should return 401 if user with given login or email doesn't exist`, async () => {
      const data: LoginInputDto = {
        loginOrEmail: 'non-existing',
        password: 'somePassword',
      };

      await authTestManager.login(data, HttpStatus.UNAUTHORIZED);
    });

    // wrong password
    it('should return 401 if password is wrong', async () => {
      const data: LoginInputDto = {
        loginOrEmail: userData.login,
        password: 'wrong',
      };

      await authTestManager.login(data, HttpStatus.UNAUTHORIZED);
    });

    // log in by login
    it('should successfully log in user by login', async () => {
      const data: LoginInputDto = {
        loginOrEmail: userData.login,
        password: userData.password,
      };

      const response = await authTestManager.login(data, HttpStatus.OK);
      await authTestManager.validateAuthTokensResponse(response);
    });

    // log in by email
    it('should successfully log in user by email', async () => {
      const data: LoginInputDto = {
        loginOrEmail: userData.email,
        password: userData.password,
      };

      const response = await authTestManager.login(data, HttpStatus.OK);
      await authTestManager.validateAuthTokensResponse(response);
    });

    it('should return 401 when trying to log in deleted user', async () => {
      const deletedUserData =
        await usersCommonTestManager.createDeletedUserWithGeneratedData();

      const loginData: LoginInputDto = {
        loginOrEmail: deletedUserData.login,
        password: deletedUserData.password,
      };
      await authTestManager.login(loginData, HttpStatus.UNAUTHORIZED);
    });

    it('should add new device session after successful login', async () => {
      const userData: CreateUserDto = {
        login: 'session',
        email: 'session@example.com',
        password: 'qwerty',
      };
      await usersCommonTestManager.createUser(userData);

      const loginInput: LoginInputDto = {
        loginOrEmail: userData.login,
        password: userData.password,
      };
      const userAgent = 'TestBrowser/1.0';
      const firstLoginResponse = await request(app.getHttpServer())
        .post(AUTH_PATH + '/login')
        .set('User-Agent', userAgent)
        .send(loginInput)
        .expect(HttpStatus.OK);
      await authTestManager.login(loginInput, HttpStatus.OK);

      const firstRefreshToken =
        authTestManager.extractRefreshTokenFromResponse(firstLoginResponse);

      const deviceSessions =
        await securityDevicesCommonTestManager.getUserDeviceSessions(
          firstRefreshToken,
        );
      authTestManager.validateDeviceSession(deviceSessions[0], userAgent);

      // check deviceId is unique
      expect(deviceSessions[1].deviceId).not.toBe(deviceSessions[0].deviceId);
    });
  });

  describe('me', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return info about current user', async () => {
      const userData: CreateUserDto = {
        login: 'success',
        email: 'success@example.com',
        password: 'qwerty',
      };
      const user = await usersCommonTestManager.createUser(userData);

      const accessToken = await authTestManager.getNewAccessToken(
        userData.login,
        userData.password,
      );

      const response = await authTestManager.me(
        'Bearer ' + accessToken,
        HttpStatus.OK,
      );
      const userInfo: MeViewDto = response.body;

      expect(userInfo.login).toBe(userData.login);
      expect(userInfo.email).toBe(userData.email);
      expect(userInfo.userId).toBe(user.id);
    });

    describe('authentication', () => {
      const userData: CreateUserDto = {
        login: 'auth',
        email: 'auth@example.com',
        password: 'qwerty',
      };

      beforeAll(async () => {
        await deleteAllData(app);

        await usersCommonTestManager.createUser(userData);
      });

      // missing
      it('should return 401 if authorization is missing', async () => {
        await authTestManager.me('', HttpStatus.UNAUTHORIZED);
      });

      // non-existing token
      it('should return 401 if access token is invalid', async () => {
        const accessToken = 'random';
        await authTestManager.me(
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });

      // wrong format auth header
      it('should return 401 if auth header format is invalid', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        await authTestManager.me(accessToken, HttpStatus.UNAUTHORIZED);
      });

      // expired token
      it('should return 401 if access token is expired', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );

        await delay(accessTokenExpInMs);

        await authTestManager.me(
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });
  });

  describe('registration', () => {
    let emailService: EmailService;

    beforeAll(async () => {
      await deleteAllData(app);

      emailService = app.get(EmailService);
    });

    beforeEach(async () => {
      (emailService.sendConfirmationEmail as jest.Mock).mockClear();
    });

    it('should register user', async () => {
      const inputDto: CreateUserDto = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };

      await authTestManager.register(inputDto, HttpStatus.NO_CONTENT);

      const getUsersResponse = await usersCommonTestManager.getUsers();
      const createdUser: UserViewDto = getUsersResponse.body.items[0];

      usersTestManager.checkCreatedUserViewFields(createdUser, inputDto);

      const dbCreatedUserConfirmationInfo =
        await usersTestRepository.findUserConfirmationInfo(createdUser.id);
      expect(dbCreatedUserConfirmationInfo.isConfirmed).toBe(false);
      expect(dbCreatedUserConfirmationInfo.confirmationCode).not.toBeNull();

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    });

    describe('validation', () => {
      let existingUser: UserViewDto;
      const validInput: CreateUserInputDto = {
        login: 'free',
        email: 'free@example.com',
        password: 'qwerty',
      };

      beforeAll(async () => {
        await deleteAllData(app);

        existingUser = await usersCommonTestManager.createUser({
          login: 'taken',
          email: 'taken@example.com',
          password: 'qwerty',
        });
      });

      afterEach(async () => {
        await usersCommonTestManager.checkUsersCount(1);

        expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(0);
      });

      it('should return 400 if login is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          login: 4,
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          login: '',
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          login: '  ',
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          login: 'a'.repeat(11),
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data5);

        // too short
        const data6 = {
          login: 'a'.repeat(2),
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data6);

        // does not match pattern
        const data7 = {
          login: '//     //',
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data7);

        // already taken
        const data8 = {
          login: existingUser.login,
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data8);

        for (const data of invalidDataCases) {
          const response = await authTestManager.register(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'login',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if email is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          login: validInput.login,
          password: validInput.password,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          login: validInput.login,
          email: 4,
          password: validInput.password,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          login: validInput.login,
          email: '',
          password: validInput.password,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          login: validInput.login,
          email: '  ',
          password: validInput.password,
        };
        invalidDataCases.push(data4);

        // does not match pattern
        const data7 = {
          login: validInput.login,
          email: 'without domain',
          password: validInput.password,
        };
        invalidDataCases.push(data7);

        // already taken
        const data8 = {
          login: validInput.login,
          email: existingUser.email,
          password: validInput.password,
        };
        invalidDataCases.push(data8);

        for (const data of invalidDataCases) {
          const response = await authTestManager.register(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'email',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if password is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          login: validInput.login,
          email: validInput.email,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          login: validInput.login,
          email: validInput.email,
          password: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          login: validInput.login,
          email: validInput.email,
          password: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          login: validInput.login,
          email: validInput.email,
          password: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          login: validInput.login,
          email: validInput.email,
          password: 'a'.repeat(21),
        };
        invalidDataCases.push(data5);

        // too short
        const data6 = {
          login: validInput.login,
          email: validInput.email,
          password: 'a'.repeat(5),
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await authTestManager.register(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'password',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          login: '',
          email: 'without domain',
        };

        const response = await authTestManager.register(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'login',
              message: expect.any(String),
            },
            {
              field: 'email',
              message: expect.any(String),
            },
            {
              field: 'password',
              message: expect.any(String),
            },
          ]),
        });
        expect(response.body.errorsMessages).toHaveLength(3);
      });
    });
  });

  describe('registration confirmation', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should confirm registration', async () => {
      const userData: CreateUserDto = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const getUsersResponse = await usersCommonTestManager.getUsers();
      const createdUser = getUsersResponse.body.items[0] as UserViewDto;

      const confirmationCode =
        await usersTestRepository.findConfirmationCodeOfLastCreatedUser();

      const inputDto: RegistrationConfirmationCodeInputDto = {
        code: confirmationCode,
      };
      await authTestManager.confirmRegistration(
        inputDto,
        HttpStatus.NO_CONTENT,
      );

      const dbUserConfirmationInfo =
        await usersTestRepository.findUserConfirmationInfo(createdUser.id);
      expect(dbUserConfirmationInfo.isConfirmed).toBe(true);
    });

    describe('validation', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      // invalid code (wrong format)
      it('should return 400 if format of confirmation code is wrong', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {};
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          code: 4,
        };
        invalidDataCases.push(data2);

        // empty
        const data3 = {
          code: '',
        };
        invalidDataCases.push(data3);

        // empty with spaces
        const data4 = {
          code: '  ',
        };
        invalidDataCases.push(data4);

        for (const data of invalidDataCases) {
          const response = await authTestManager.confirmRegistration(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'code',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      // incorrect (non-existing) code
      it('should return 400 if confirmation code matches no user', async () => {
        const inputDto: RegistrationConfirmationCodeInputDto = {
          code: 'non-existing',
        };

        const response = await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });

      // code of deleted user
      it('should return 400 if confirmation code matches deleted user', async () => {
        const userToDeleteData: CreateUserDto = {
          login: 'deleted',
          email: 'deleted@example.com',
          password: 'qwerty',
        };
        await authTestManager.register(userToDeleteData, HttpStatus.NO_CONTENT);

        const getUsersResponse = await usersCommonTestManager.getUsers();
        const userToDelete = getUsersResponse.body.items[0] as UserViewDto;

        await usersCommonTestManager.deleteUser(userToDelete.id);

        const code = await usersTestRepository.findUserConfirmationCode(
          userToDelete.id,
        );

        const response = await authTestManager.confirmRegistration(
          { code },
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });

      // already confirmed user
      it('should return 400 when trying to confirm already confirmed user', async () => {
        const userData: CreateUserDto = {
          login: 'confirmed',
          email: 'confirmed@example.com',
          password: 'qwerty',
        };
        await authTestManager.register(userData, HttpStatus.NO_CONTENT);

        const confirmationCode =
          await usersTestRepository.findConfirmationCodeOfLastCreatedUser();

        const inputDto: RegistrationConfirmationCodeInputDto = {
          code: confirmationCode,
        };
        await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.NO_CONTENT,
        );

        const response = await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });

      // expired code
      it('should return 400 if confirmation code is expired', async () => {
        const userData: CreateUserDto = {
          login: 'expired',
          email: 'expired@example.com',
          password: 'qwerty',
        };
        await authTestManager.register(userData, HttpStatus.NO_CONTENT);

        const confirmationCode =
          await usersTestRepository.findConfirmationCodeOfLastCreatedUser();

        const inputDto: RegistrationConfirmationCodeInputDto = {
          code: confirmationCode,
        };

        await delay(emailConfirmationCodeExpInMs);

        const response = await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });
    });
  });

  describe('registration email resending', () => {
    let emailService: EmailService;

    beforeAll(async () => {
      await deleteAllData(app);

      emailService = app.get(EmailService);
    });

    beforeEach(async () => {
      (emailService.sendConfirmationEmail as jest.Mock).mockClear();
    });

    // invalid email
    it('should return 400 if email is invalid', async () => {
      const invalidDataCases: any[] = [];

      // missing
      const data1 = {};
      invalidDataCases.push(data1);

      // not string
      const data2 = {
        email: 4,
      };
      invalidDataCases.push(data2);

      // empty string
      const data3 = {
        email: '',
      };
      invalidDataCases.push(data3);

      // empty string with spaces
      const data4 = {
        email: '  ',
      };
      invalidDataCases.push(data4);

      // does not match pattern
      const data7 = {
        email: 'without domain',
      };
      invalidDataCases.push(data7);

      for (const data of invalidDataCases) {
        const response = await authTestManager.resendRegistrationEmail(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'email',
              message: expect.any(String),
            },
          ],
        });
      }

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(0);
    });

    // email matches no user
    it('should return 400 if email matches no user', async () => {
      const inputDto: RegistrationEmailResendingInputDto = {
        email: 'nonExisting@example.com',
      };

      const response = await authTestManager.resendRegistrationEmail(
        inputDto,
        HttpStatus.BAD_REQUEST,
      );
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: expect.any(String),
          },
        ],
      });

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(0);
    });

    // already confirmed user
    it('should return 204 if user is already confirmed', async () => {
      const userData: CreateUserDto = {
        login: 'confirmed',
        email: 'confirmed@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const confirmationCode =
        await usersTestRepository.findConfirmationCodeOfLastCreatedUser();

      await authTestManager.confirmRegistration(
        { code: confirmationCode },
        HttpStatus.NO_CONTENT,
      );

      const inputDto: RegistrationEmailResendingInputDto = {
        email: userData.email,
      };
      const response = await authTestManager.resendRegistrationEmail(
        inputDto,
        HttpStatus.BAD_REQUEST,
      );
      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: 'email',
            message: expect.any(String),
          },
        ],
      });

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    });

    // success
    it('should resend registration email without actually sending it', async () => {
      const userData: CreateUserDto = {
        login: 'success',
        email: 'success@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const inputDto: RegistrationEmailResendingInputDto = {
        email: userData.email,
      };
      await authTestManager.resendRegistrationEmail(
        inputDto,
        HttpStatus.NO_CONTENT,
      );

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('password recovery', () => {
    let emailService: EmailService;

    beforeAll(async () => {
      await deleteAllData(app);

      emailService = app.get(EmailService);
    });

    beforeEach(async () => {
      (emailService.sendPasswordRecoveryEmail as jest.Mock).mockClear();
    });

    // invalid email
    it('should return 400 if email is invalid', async () => {
      const invalidDataCases: any[] = [];

      // missing
      const data1 = {};
      invalidDataCases.push(data1);

      // not string
      const data2 = {
        email: 4,
      };
      invalidDataCases.push(data2);

      // empty string
      const data3 = {
        email: '',
      };
      invalidDataCases.push(data3);

      // empty string with spaces
      const data4 = {
        email: '  ',
      };
      invalidDataCases.push(data4);

      // does not match pattern
      const data7 = {
        email: 'without domain',
      };
      invalidDataCases.push(data7);

      for (const data of invalidDataCases) {
        const response = await authTestManager.recoverPassword(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'email',
              message: expect.any(String),
            },
          ],
        });
      }

      expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(0);
    });

    // email matches no user
    it('should return 204 if email matches no user', async () => {
      const inputDto: PasswordRecoveryInputDto = {
        email: 'nonExisting@example.com',
      };

      await authTestManager.recoverPassword(inputDto, HttpStatus.NO_CONTENT);

      expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(0);
    });

    // success
    it('should request password recovery without actually sending email', async () => {
      const userData: CreateUserDto = {
        login: 'success',
        email: 'success@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const inputDto: PasswordRecoveryInputDto = {
        email: userData.email,
      };
      await authTestManager.recoverPassword(inputDto, HttpStatus.NO_CONTENT);

      expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('new password', () => {
    let cryptoService: CryptoService;

    beforeAll(async () => {
      await deleteAllData(app);

      cryptoService = app.get(CryptoService);
    });

    // success
    it('should set new password', async () => {
      const userData: CreateUserDto = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };

      const user = await usersCommonTestManager.createUser(userData);

      const recoveryCode = 'code';
      const recoveryCodeHash =
        cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

      await usersTestRepository.setUserPasswordRecoveryCodeHash(
        user.id,
        recoveryCodeHash,
      );

      const inputDto: NewPasswordRecoveryInputDto = {
        recoveryCode,
        newPassword: 'newPassword',
      };

      await authTestManager.setNewPassword(inputDto, HttpStatus.NO_CONTENT);

      await authTestManager.login(
        {
          loginOrEmail: userData.login,
          password: inputDto.newPassword,
        },
        HttpStatus.OK,
      );
    });

    describe('validation', () => {
      let usersData: CreateUserDto[];
      let users: UserViewDto[];
      let recoveryCodes: string[];
      let validInputDto: NewPasswordRecoveryInputDto;

      beforeAll(async () => {
        await deleteAllData(app);

        usersData = [
          {
            login: 'user1',
            email: 'user1@example.com',
            password: 'qwerty',
          },
          {
            login: 'user2',
            email: 'user2@example.com',
            password: 'qwerty',
          },
          {
            login: 'user3',
            email: 'user3@example.com',
            password: 'qwerty',
          },
          {
            login: 'user4',
            email: 'user4@example.com',
            password: 'qwerty',
          },
        ];

        users = await usersCommonTestManager.createUsers(usersData);

        recoveryCodes = ['code1', 'code2', 'code3', 'code4'];
        const recoveryCodesHashes = recoveryCodes.map(
          cryptoService.createPasswordRecoveryCodeHash,
        );

        for (let i = 0; i < usersData.length; i++) {
          await usersTestRepository.setUserPasswordRecoveryCodeHash(
            users[i].id,
            recoveryCodesHashes[i],
          );
        }

        validInputDto = {
          newPassword: 'newPassword',
          recoveryCode: recoveryCodes[0],
        };
      });

      // invalid password
      it('should return 400 if password is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          recoveryCode: validInputDto.recoveryCode,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: 'a'.repeat(21),
        };
        invalidDataCases.push(data5);

        // too short
        const data6 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: 'a'.repeat(5),
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await authTestManager.setNewPassword(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'newPassword',
                message: expect.any(String),
              },
            ],
          });
        }

        await authTestManager.login(
          {
            loginOrEmail: usersData[0].login,
            password: usersData[0].password,
          },
          HttpStatus.OK,
        );
      });

      // invalid recovery code
      it('should return 400 if format of recovery code is wrong', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          code: 4,
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data2);

        // empty
        const data3 = {
          code: '',
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data3);

        // empty with spaces
        const data4 = {
          code: '  ',
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data4);

        for (const data of invalidDataCases) {
          const response = await authTestManager.setNewPassword(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'recoveryCode',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      // multiple errors
      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          recoveryCode: '',
          newPassword: 4,
        };

        const response = await authTestManager.setNewPassword(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
            {
              field: 'newPassword',
              message: expect.any(String),
            },
          ]),
        });
      });

      // non-existing code
      it('should return 400 if recovery code matches no user', async () => {
        const inputDto: NewPasswordRecoveryInputDto = {
          recoveryCode: 'non-existing',
          newPassword: validInputDto.newPassword,
        };

        const response = await authTestManager.setNewPassword(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });
      });

      // code of deleted user
      it('should return 400 if recovery code matches deleted user', async () => {
        const inputDto: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[1],
          newPassword: validInputDto.newPassword,
        };

        await usersCommonTestManager.deleteUser(users[1].id);

        const response = await authTestManager.setNewPassword(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });
      });

      // expired code
      it('should return 400 if recovery code is expired', async () => {
        await usersTestRepository.setUserPasswordRecoveryExpirationDate(
          users[2].id,
          new Date(),
        );

        const inputDto: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[2],
          newPassword: validInputDto.newPassword,
        };

        const response = await authTestManager.setNewPassword(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });

        await authTestManager.login(
          {
            loginOrEmail: usersData[2].login,
            password: usersData[2].password,
          },
          HttpStatus.OK,
        );
      });

      // already used code
      it('should return 400 is recovery code has already been applied', async () => {
        const inputDto1: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[3],
          newPassword: 'newPassword1',
        };
        const inputDto2: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[3],
          newPassword: 'newPassword2',
        };

        await authTestManager.setNewPassword(inputDto1, HttpStatus.NO_CONTENT);

        const response = await authTestManager.setNewPassword(
          inputDto2,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });

        await authTestManager.login(
          {
            loginOrEmail: usersData[3].login,
            password: inputDto1.newPassword,
          },
          HttpStatus.OK,
        );
      });
    });
  });

  describe('refresh token', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('authentication', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(2);
      });

      // missing
      it('should return 401 if refresh token cookie is missing', async () => {
        await request(app.getHttpServer())
          .post(AUTH_PATH + '/refresh-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      // non-existing token
      it('should return 401 if refresh token is invalid', async () => {
        await authTestManager.refreshToken('random', HttpStatus.UNAUTHORIZED);
      });

      // expired token
      it('should return 401 if refresh token is expired', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        await delay(refreshTokenExpInMs);

        await authTestManager.refreshToken(
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
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(3);
      });

      it('should return valid auth tokens after successful token refresh', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        const response = await authTestManager.refreshToken(
          refreshToken,
          HttpStatus.OK,
        );
        await authTestManager.validateAuthTokensResponse(response);
      });

      it('refresh token cannot be reused after successful token refresh', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[1],
        );

        await waitForTokenRotation();

        await authTestManager.refreshToken(refreshToken, HttpStatus.OK);

        await authTestManager.assertRefreshTokenIsInvalid(refreshToken);
      });

      it('should update device session after successful token refresh', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[2],
        );

        const deviceSessionsBeforeRefresh =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            refreshToken,
          );
        const deviceSessionBeforeRefresh = deviceSessionsBeforeRefresh[0];

        await waitForTokenRotation();

        const refreshResponse = await authTestManager.refreshToken(
          refreshToken,
          HttpStatus.OK,
        );
        const newRefreshToken =
          authTestManager.extractRefreshTokenFromResponse(refreshResponse);

        const deviceSessionsAfterRefresh =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            newRefreshToken,
          );
        const deviceSessionAfterRefresh = deviceSessionsAfterRefresh[0];

        expect(deviceSessionAfterRefresh.deviceId).toBe(
          deviceSessionBeforeRefresh.deviceId,
        );
        expect(
          +new Date(deviceSessionAfterRefresh.lastActiveDate),
        ).toBeGreaterThan(+new Date(deviceSessionBeforeRefresh.lastActiveDate));
      });
    });
  });

  describe('logout', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('authentication', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(2);
      });

      // missing
      it('should return 401 if refresh token cookie is missing', async () => {
        await request(app.getHttpServer())
          .post(AUTH_PATH + '/logout')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      // non-existing token
      it('should return 401 if refresh token is invalid', async () => {
        await authTestManager.logout('random', HttpStatus.UNAUTHORIZED);
      });

      // expired token
      it('should return 401 if refresh token is expired', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        await delay(refreshTokenExpInMs);

        await authTestManager.logout(refreshToken, HttpStatus.UNAUTHORIZED);
      });
    });

    describe('success', () => {
      let usersLoginInput: LoginInputDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersLoginInput =
          await usersCommonTestManager.getLoginInputOfGeneratedUsers(2);
      });

      it('should make refresh token unusable after successful logout', async () => {
        const refreshToken = await authTestManager.getNewRefreshToken(
          usersLoginInput[0],
        );

        await authTestManager.logout(refreshToken, HttpStatus.NO_CONTENT);

        await authTestManager.assertRefreshTokenIsInvalid(refreshToken);
      });

      it('should remove device session from active sessions after successful logout', async () => {
        const refreshToken1 = await authTestManager.getNewRefreshToken(
          usersLoginInput[1],
        );
        const refreshToken2 = await authTestManager.getNewRefreshToken(
          usersLoginInput[1],
        );

        const deviceSessionsBeforeLogout =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            refreshToken1,
          );

        await authTestManager.logout(refreshToken2, HttpStatus.NO_CONTENT);

        const deviceSessionsAfterLogout =
          await securityDevicesCommonTestManager.getUserDeviceSessions(
            refreshToken1,
          );

        expect(deviceSessionsAfterLogout.length).toBe(
          deviceSessionsBeforeLogout.length - 1,
        );
        expect(deviceSessionsAfterLogout[0].deviceId).toBe(
          jwtTestManager.extractDeviceIdFromRefreshToken(refreshToken1),
        );
      });
    });
  });
});
